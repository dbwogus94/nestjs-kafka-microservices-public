import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiGatewayTimeoutResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SenderDTO } from 'src/common/dto/sender.dto';
import { responseMessage, errorMessage } from 'src/common/response-message';
import {
  CreateProductDTO,
  searchOptionDTO,
  UpdateProductDTO,
} from 'src/product/dto/product.dto';
import { GetProductResponse } from './dto/product.response';
import { Product } from './product.entity';
import { ProductProducer } from './product.producer';
import { ProductService } from './product.service';

@ApiTags('상품 API')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productProducer: ProductProducer,
  ) {}

  @Get()
  @ApiOperation({ summary: '상품 리스트 조회' })
  @ApiOkResponse({ description: responseMessage.getProducts, type: Product })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  getProducts(): Promise<Product[]> {
    return this.productService.getProducts();
  }

  @Get('/:id')
  @ApiOperation({ summary: '상품 단일 조회' })
  @ApiOkResponse({
    description: responseMessage.getProduct,
    type: GetProductResponse,
  })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  getProduct(
    @Query() optionDTO: searchOptionDTO,
    @Param('id', new ParseIntPipe()) productId: number,
  ) {
    const { include } = optionDTO;
    return include === 'stocks'
      ? this.productService.getProductWithStock(productId)
      : this.productService.getProduct(productId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '상품 생성' })
  @ApiCreatedResponse({
    description: responseMessage.createProduct,
    type: Product,
  })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiBadRequestResponse({ description: errorMessage.badRequest })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  createProduct(
    @Query() senderDto: SenderDTO,
    @Body() createDto: CreateProductDTO,
  ) {
    const { sender } = senderDto;
    return sender === 'gateway'
      ? this.productService.createProduct(createDto)
      : this.productProducer.sendCreateProduct(createDto);
  }

  @Patch('/:id')
  @HttpCode(201)
  @ApiOperation({ summary: '상품 수정' })
  @ApiCreatedResponse({
    description: responseMessage.updateProduct,
    type: Product,
  })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiBadRequestResponse({ description: errorMessage.badRequest })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  updateProduct(
    @Query() senderDto: SenderDTO,
    @Param('id', new ParseIntPipe()) productId: number,
    @Body() updateDto: UpdateProductDTO,
  ) {
    const { sender } = senderDto;
    return sender === 'gateway'
      ? this.productService.updateProduct(productId, updateDto)
      : this.productProducer.sendUpdateProduct(productId, updateDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '상품 삭제' })
  @ApiNoContentResponse({ description: responseMessage.deleteProduct })
  @ApiNotFoundResponse({ description: errorMessage.notFound })
  @ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
  async deleteProduct(
    @Query() senderDto: SenderDTO,
    @Param('id', new ParseIntPipe()) productId: number,
  ): Promise<void> {
    const { sender } = senderDto;
    if (sender === 'gateway') {
      await this.productService.deleteProduct(productId);
    } else {
      await this.productProducer.sendDeleteProduct(productId);
    }
  }
}
