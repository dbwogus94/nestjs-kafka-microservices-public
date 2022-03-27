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
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDTO, UpdateProductDTO } from 'src/product/product.dto';
import { ProductService } from './product.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getProducts() {
    return this.productService.getProducts();
  }

  @Get('/:id')
  getProduct(@Param('id', new ParseIntPipe()) productId: number) {
    return this.productService.getProduct(productId);
  }

  @Post()
  @HttpCode(201)
  createProduct(@Body() createDto: CreateProductDTO) {
    return this.productService.createProduct(createDto);
  }

  @Patch('/:id')
  @HttpCode(201)
  updateProduct(
    @Param('id', new ParseIntPipe()) productId: number,
    @Body() updateDto: UpdateProductDTO,
  ) {
    return this.productService.updateProduct(productId, updateDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteProduct(
    @Param('id', new ParseIntPipe()) productId: number,
  ): Promise<void> {
    await this.productService.deleteProduct(productId);
  }
}
