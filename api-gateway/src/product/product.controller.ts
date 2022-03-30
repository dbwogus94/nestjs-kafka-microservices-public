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
import {
  CreateProductDTO,
  ProductDTO,
  searchOptionDTO,
  UpdateProductDTO,
} from './dto/product.dto';
import { ProductHttpService } from './product.http.service';
import { errorMessage, responseMessage } from './response-message';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
@ApiTags('상품 API')
@ApiNotFoundResponse({ description: errorMessage.notFound })
@ApiBadRequestResponse({ description: errorMessage.badRequest })
@ApiGatewayTimeoutResponse({ description: errorMessage.gatewayTimeout })
export class ProductController {
  constructor(private readonly productService: ProductHttpService) {}

  @Get()
  @ApiOperation({ summary: '상품 리스트 조회' })
  @ApiOkResponse({ description: responseMessage.getProducts, type: ProductDTO })
  getProducts() {
    return this.productService.callGetProducts();
  }

  @Get('/:id')
  @ApiOperation({ summary: '상품 단일 조회' })
  @ApiOkResponse({ description: responseMessage.getProduct, type: ProductDTO })
  getProduct(
    @Query() optionDTO: searchOptionDTO,
    @Param('id', new ParseIntPipe()) productId: number,
  ) {
    const { include } = optionDTO;
    return this.productService.callGetProduct(productId, include);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '상품 생성' })
  @ApiCreatedResponse({
    description: responseMessage.createProduct,
    type: ProductDTO,
  })
  createProduct(@Body() createDto: CreateProductDTO) {
    return this.productService.callPostProduct(createDto);
  }

  @Patch('/:id')
  @HttpCode(201)
  @ApiOperation({ summary: '상품 수정' })
  @ApiCreatedResponse({
    description: responseMessage.createProduct,
    type: ProductDTO,
  })
  updateProduct(
    @Param('id', new ParseIntPipe()) productId: number,
    @Body() updateDto: UpdateProductDTO,
  ) {
    return this.productService.callPatchProduct(productId, updateDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '상품 삭제' })
  @ApiNoContentResponse({ description: responseMessage.deleteProduct })
  deleteProduct(
    @Param('id', new ParseIntPipe()) productId: number,
  ): Promise<void> {
    return this.productService.callDeleteProduct(productId);
  }
}
