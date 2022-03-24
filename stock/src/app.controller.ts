import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateStockDto, DeleteStockDto } from './stock.dto';

@Controller('stocks')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(201)
  createStock(@Body() createDto: CreateStockDto) {
    // TODO: 카프카로 보내기
    // return this.appService.sendCreateStock(createDto);
    return this.appService.createStock(createDto);
  }

  @Delete('/:id') // TODO: 상품이 제거되면서 오는 요청은  productId가 필요한 하다 어떻게 처리할까??
  @HttpCode(204)
  async deleteStock(@Param('id', new ParseIntPipe()) productId: number) {
    // TODO: 카프카로 보내기
    await this.appService.sendDeleteStock(productId);
    // await this.appService.deleteStock(deleteDto);
  }
}
