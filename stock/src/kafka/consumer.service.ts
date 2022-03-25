import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopic,
  Kafka,
} from 'kafkajs';
import { KafkaConfig } from 'src/config/schema.config';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logTag = 'ConsumerService';
  private readonly kafka: Kafka;
  private readonly consumerGroups: Consumer[] = [];

  constructor(
    private configService: ConfigService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {
    const { brokers } = this.configService.get<KafkaConfig>('kafka');
    this.kafka = new Kafka({ brokers });
  }

  async consume(
    consumerConfig: ConsumerConfig,
    topics: ConsumerSubscribeTopic[],
    consumerRunConfig: ConsumerRunConfig,
  ) {
    const consumer = this.kafka.consumer(consumerConfig);
    try {
      await consumer.connect();
      await Promise.all(topics.map(async (topic) => consumer.subscribe(topic)));
      await consumer.run(consumerRunConfig);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw error;
    }
    this.consumerGroups.push(consumer);
  }

  async onApplicationShutdown() {
    try {
      await Promise.all(
        this.consumerGroups.map(async (consumer) => consumer.disconnect()),
      );
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
    }
  }
}
