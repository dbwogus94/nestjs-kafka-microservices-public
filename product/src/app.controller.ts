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
import { AppService } from './app.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getProducts() {
    return this.appService.getProducts();
  }

  @Get('/:id')
  getProduct(@Param('id', new ParseIntPipe()) productId: number) {
    return this.appService.getProduct(productId);
  }

  @Post()
  @HttpCode(201)
  createProduct(@Body() createDto: CreateProductDTO) {
    return this.appService.sendCreateProduct(createDto);
  }

  @Patch('/:id')
  @HttpCode(201)
  updateProduct(
    @Param('id', new ParseIntPipe()) productId: number,
    @Body() updateDto: UpdateProductDTO,
  ) {
    return this.appService.sendUpdateProduct(productId, updateDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteProduct(
    @Param('id', new ParseIntPipe()) productId: number,
  ): Promise<void> {
    await this.appService.sendDeleteProduct(productId);
  }
}
