import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KafkaModule } from 'src/kafka/kafka.module';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockProducer } from './stock.producer';
import { StockConsumer } from './stock.consumer';

@Module({
  imports: [HttpModule, KafkaModule],
  controllers: [StockController],
  providers: [StockService, StockProducer, StockConsumer, Logger],
})
export class StockModule {}
