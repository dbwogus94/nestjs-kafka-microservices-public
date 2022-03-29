import { Logger, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';

@Module({
  providers: [ProducerService, ConsumerService, Logger],
  exports: [ProducerService, ConsumerService],
})
export class KafkaModule {}
