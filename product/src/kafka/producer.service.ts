import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { KafkaConfig } from 'src/config/schema.config';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly logTag = 'ProducerServices';
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(
    private configService: ConfigService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {
    const { brokers } = this.configService.get<KafkaConfig>('kafka');
    this.kafka = new Kafka({ brokers });
    this.producer = this.kafka.producer();
  }

  // nest lifecycle event
  async onModuleInit() {
    await this.producer.connect();
  }

  /**
   * 카프카 토픽으로 전송
   * @param record
   */
  async produce(record: ProducerRecord) {
    try {
      await this.producer.send(record);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException(error);
    }
  }

  // nest lifecycle event
  async onApplicationShutdown() {
    try {
      await this.producer.disconnect();
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      // throw new InternalServerErrorException(error);
    }
  }
}
