import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockController } from './stock.controller';
import { StockHttpService } from './stock.http.service';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [StockHttpService, Logger],
})
export class StockModule {}
