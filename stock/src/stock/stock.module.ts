import { Logger, Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockProducer } from './stock.producer';
import { StockConsumer } from './stock.consumer';

@Module({
  controllers: [StockController],
  providers: [StockService, StockProducer, StockConsumer, Logger],
})
export class StockModule {}
