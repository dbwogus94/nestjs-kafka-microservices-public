import {
  Inject,
  Injectable,
  InternalServerErrorException,
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
  private readonly consumers: Consumer[] = [];

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
    topic: ConsumerSubscribeTopic,
    consumerRunConfig: ConsumerRunConfig,
  ) {
    const consumer = this.kafka.consumer(consumerConfig); //{ groupId: 'nestjs-kafka' }
    try {
      await consumer.connect();
      await consumer.subscribe(topic);
      await consumer.run(consumerRunConfig);
      this.consumers.push(consumer);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException(error);
    }
  }

  async onApplicationShutdown() {
    try {
      await Promise.all(
        this.consumers.map(async (consumer) => consumer.disconnect()),
      );
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
    }
  }
}
