import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SenderDTO } from 'src/common/dto/sender.dto';
import { CreateStockDto } from './stock.dto';
import { StockProducer } from './stock.producer';
import { StockService } from './stock.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products/:productId/stocks')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly stockProducer: StockProducer,
  ) {}

  @Get()
  getStock(@Param('productId', new ParseIntPipe()) productId: number) {
    return this.stockService.getStockByProductId(productId);
  }

  @Post()
  @HttpCode(201)
  createStock(
    @Query() senderDto: SenderDTO,
    @Body() createDto: CreateStockDto,
  ) {
    const { sender } = senderDto;
    return sender === 'gateway'
      ? this.stockService.createStock(createDto)
      : this.stockProducer.sendCreateStock(createDto);
  }

  @Delete() // TODO: 상품이 제거되면서 오는 요청은  productId가 필요한 하다 어떻게 처리할까??
  @HttpCode(204)
  async deleteStock(
    @Query() senderDto: SenderDTO,
    @Param('productId', new ParseIntPipe()) productId: number,
  ) {
    const { sender } = senderDto;
    if (sender === 'gateway') {
      await this.stockService.deleteStock(productId);
    } else {
      await this.stockProducer.sendDeleteStock(productId);
    }
  }
}
