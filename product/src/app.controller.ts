import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

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
    // 카프카로
    return this.appService.sendCreateProduct(createDto);
    // return this.appService.createProduct(createDto);
  }

  @Patch('/:id')
  @HttpCode(201)
  updateProduct(
    // 카프카로
    @Param('id', new ParseIntPipe()) productId: number,
    @Body() updateDto: UpdateProductDTO,
  ) {
    return this.appService.sendUpdateProduct(productId, updateDto);
    // return this.appService.updateProduct(productId, updateDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteProduct(
    @Param('id', new ParseIntPipe()) productId: number,
  ): Promise<void> {
    await this.appService.sendDeleteProduct(productId);
    //await this.appService.deleteProduct(productId);
  }
}
