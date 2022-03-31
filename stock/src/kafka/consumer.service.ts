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
  EachMessagePayload,
  Kafka,
} from 'kafkajs';
import { KafkaConfig } from 'src/config/schema.config';
import { KafkaService } from './kafka.service';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logTag = 'ConsumerService';
  private readonly consumerGroups: { [k in string]: Consumer } = {};

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private kafkaService: KafkaService,
  ) {}

  private getConsumer(groupId: string): Consumer | undefined {
    return this.consumerGroups[groupId];
  }

  async consume(
    consumerConfig: ConsumerConfig,
    topics: ConsumerSubscribeTopic[],
    consumerRunConfig: ConsumerRunConfig,
  ) {
    const consumer = this.kafkaService.getClient().consumer(consumerConfig);
    try {
      await consumer.connect();
      await Promise.all(topics.map(async (topic) => consumer.subscribe(topic)));
      await consumer.run(consumerRunConfig);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw error;
    }
    const { groupId } = consumerConfig;
    this.consumerGroups[groupId] = consumer;
  }

  async commitOffset(groupId: string, data: EachMessagePayload) {
    const { topic, partition, message } = data;
    try {
      await this.getConsumer(groupId).commitOffsets([
        {
          topic,
          partition,
          offset: String(Number.parseInt(message.offset) + 1),
        },
      ]);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw error;
    }
  }

  async onApplicationShutdown() {
    try {
      await Promise.all(
        Object.values(this.consumerGroups).map(async (consumer) =>
          consumer.disconnect(),
        ),
      );
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
    }
  }
}
