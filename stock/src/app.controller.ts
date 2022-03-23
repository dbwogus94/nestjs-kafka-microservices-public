import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('stock_created')
  createStock(message: any) {
    this.appService.createStock(message.value);
  }

  @EventPattern('stock_deleted')
  deleteStock(message: any) {
    this.appService.deleteStock(message.value);
  }
}
