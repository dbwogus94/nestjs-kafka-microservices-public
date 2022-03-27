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
import { SenderDTO } from 'src/common/dto/sender.dto';
import {
  CreateProductDTO,
  searchOptionDTO,
  UpdateProductDTO,
} from 'src/product/product.dto';
import { ProductProducer } from './product.producer';
import { ProductService } from './product.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productProducer: ProductProducer,
  ) {}

  @Get()
  getProducts() {
    return this.productService.getProducts();
  }

  @Get('/:id')
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
