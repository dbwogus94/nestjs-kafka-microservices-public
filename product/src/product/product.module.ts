import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ProductConsumer } from 'src/product/product.consumer';
import { ProductController } from './product.controller';
import { ProductProducer } from './product.producer';
import { ProductService } from './product.service';
import { StockHttpService } from './stock/stock.http.service';

@Module({
  imports: [HttpModule, KafkaModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductProducer,
    ProductConsumer,
    Logger,
    StockHttpService,
  ],
})
export class ProductModule {}
