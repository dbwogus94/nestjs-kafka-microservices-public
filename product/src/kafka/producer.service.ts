import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Producer, ProducerRecord } from 'kafkajs';
import { KafkaService } from './kafka.service';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly logTag = 'ProducerServices';
  private readonly producer: Producer;

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private kafkaService: KafkaService,
  ) {
    this.producer = this.kafkaService.getClient().producer();
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
    }
  }
}
