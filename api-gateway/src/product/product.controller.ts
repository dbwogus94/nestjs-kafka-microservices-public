import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiGatewayTimeoutResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateProductDTO, ProductDTO, searchOptionDTO } from './product.dto';
import { ProductHttpService } from './product.service';
import { errorMessage, responseMessage } from './response-message';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductHttpService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '상품 리스트 조회' })
  @ApiOkResponse({ description: responseMessage.getProducts, type: ProductDTO })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  getProducts() {
    return this.productService.callGetProducts();
  }

  @Get('/:id')
  @HttpCode(200)
  @ApiOperation({ summary: '상품 단일 조회' })
  @ApiOkResponse({ description: responseMessage.getProduct, type: ProductDTO })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  getProduct(
    @Query() optionDTO: searchOptionDTO,
    @Param('id', new ParseIntPipe()) productId: number,
  ) {
    const { include } = optionDTO;

    return !!include && include === 'stocks'
      ? this.productService.callGetProduct(productId, include)
      : this.productService.callGetProduct(productId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '상품 생성' })
  @ApiCreatedResponse({
    description: responseMessage.createProduct,
    type: ProductDTO,
  })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiBadRequestResponse({ description: errorMessage.badRequest })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  createProduct(@Body() createDto: CreateProductDTO) {
    return this.productService.callPostProduct(createDto);
  }

  // @Patch('/:id')
  // @HttpCode(201)
  // updateProduct(
  //   @Param('id', new ParseIntPipe()) productId: number,
  //   @Body() updateDto: UpdateProductDTO,
  // ) {
  //   // return this.productService.updateProduct(productId, updateDto);
  // }

  // @Delete('/:id')
  // @HttpCode(204)
  // async deleteProduct(
  //   @Param('id', new ParseIntPipe()) productId: number,
  // ): Promise<void> {
  //   // await this.productService.deleteProduct(productId);
  // }
}
