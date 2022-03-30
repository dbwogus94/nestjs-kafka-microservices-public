import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';

@Module({})
export class KafkaModule {
  static register(): DynamicModule {
    return {
      module: KafkaModule,
      providers: [ProducerService, ConsumerService, Logger],
      exports: [ProducerService, ConsumerService],
      global: true,
    };
  }
}
