import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ExceptionFilter } from './common/rpc-exception.fillter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product_selectAll')
  getProducts() {
    return this.appService.getProducts();
  }

  @MessagePattern('product_selectOne')
  // TODO: @Payload() 동작 방법 찾기
  // getProduct(@Payload() message: any, @Ctx() context: KafkaContext) {
  getProduct(message: any) {
    return this.appService.getProduct(message.value);
  }

  @UseFilters(new ExceptionFilter()) // new RpcException() 예외를 받아서 처리하는 필터.
  @MessagePattern('product_created')
  createProduct(message: any) {
    return this.appService.createProduct(message.value);
  }

  @UseFilters(new ExceptionFilter())
  @MessagePattern('product_updated')
  updateProduct(message: any) {
    return this.appService.updateProduct(message.value);
  }

  @MessagePattern('product_deleted')
  deleteProduct(message: any) {
    return this.appService.deleteProduct(message.value);
  }
}
