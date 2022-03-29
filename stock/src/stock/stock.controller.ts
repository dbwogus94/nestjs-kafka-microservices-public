import {
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
import {
  ApiCreatedResponse,
  ApiGatewayTimeoutResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SenderDTO } from 'src/common/dto/sender.dto';
import { errorMessage, responseMessage } from 'src/common/response-message';
import { Stock } from './stock.entity';
import { StockProducer } from './stock.producer';
import { StockService } from './stock.service';

@ApiTags('재고 API')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('products/:productId/stocks')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly stockProducer: StockProducer,
  ) {}

  @Get()
  @ApiOperation({ summary: '특정 상품의 재고 조회' })
  @ApiOkResponse({ description: responseMessage.getStock, type: Stock })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  getStock(@Param('productId', new ParseIntPipe()) productId: number) {
    return this.stockService.getStockByProductId(productId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '특정 상품의 재고 생성' })
  @ApiCreatedResponse({ description: responseMessage.createStock, type: Stock })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  createStock(
    @Query() senderDto: SenderDTO,
    @Param('productId', new ParseIntPipe()) productId: number,
  ) {
    const { sender } = senderDto;
    return sender === 'gateway'
      ? this.stockService.createStock(productId)
      : this.stockProducer.sendCreateStock(productId);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: '특정 상품의 재고 삭제' })
  @ApiNoContentResponse({
    description: responseMessage.deleteStock,
    type: Stock,
  })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
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
