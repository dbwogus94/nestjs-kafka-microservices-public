import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ProductConsumer } from 'src/product/product.consumer';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [HttpModule, KafkaModule],
  controllers: [ProductController],
  providers: [ProductService, ProductConsumer, Logger],
})
export class ProductModule {}
