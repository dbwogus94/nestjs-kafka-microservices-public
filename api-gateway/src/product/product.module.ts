import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductController } from './product.controller';
import { ProductHttpService } from './product.http.service';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [ProductHttpService, Logger],
})
export class ProductModule {}
