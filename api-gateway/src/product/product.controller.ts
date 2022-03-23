import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { ProductService } from './product.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    @Inject('PRODUCT_SERVICE') // ClientsModule에 정의된 서비스 명으로 의존성 주입
    private readonly productClient: ClientKafka,
  ) {}

  // 메세지 패턴(@MessagePattern)을 사용하려면 필수로 정의 해야한다.
  onModuleInit() {
    // 아래 정의되면 "${토픽명}.reply"로 신규 토픽이 추가로 생성된다.
    this.productClient.subscribeToResponseOf('product_selectAll');
    this.productClient.subscribeToResponseOf('product_selectOne');
    this.productClient.subscribeToResponseOf('product_created');
    this.productClient.subscribeToResponseOf('product_updated');
    this.productClient.subscribeToResponseOf('product_deleted');
  }

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
