import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiGatewayTimeoutResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StockDto } from './dto/stock.dto';
import { errorMessage, responseMessage } from './response-message';
import { StockHttpService } from './stock.http.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products/:productId/stocks')
@ApiTags('재고 API')
@ApiNotFoundResponse({ description: errorMessage.notFound })
@ApiBadRequestResponse({ description: errorMessage.badRequest })
@ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
export class StockController {
  constructor(private readonly stockService: StockHttpService) {}

  @Get()
  @ApiOperation({ summary: '특정 상품의 재고 조회' })
  @ApiOkResponse({ description: responseMessage.getStock, type: StockDto })
  getStock(@Param('productId', new ParseIntPipe()) productId: number) {
    return this.stockService.callGetStock(productId);
  }
}
