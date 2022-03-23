import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { Product } from './product.entity';

@Injectable()
export class AppService {
  constructor(
    @Inject('STOCK_SERVICE') private readonly stockClient: ClientKafka,
  ) {}

  async getProducts() {
    return Product.find();
  }

  async getProduct(productId: number) {
    return Product.createQueryBuilder('product')
      .innerJoinAndSelect('product.prices', 'productPrice')
      .where('product.id = :productId', { productId })
      .getOne();
  }

  async createProduct(createDto: Product) {
    const product = Product.create(createDto);

    try {
      await Product.save(product);
    } catch (error) {
      console.error(error);
      throw new RpcException(error.toString());
      // => RpcExceptionFilter받아서 api-gateway로 보낼 수 있다
    }

    // 재고 서비스에 재고 생성 event로 요청
    this.stockClient.emit('stock_created', product.id); // =>  @EventPattern('stock_created')에서 받는다.
    return product;
  }

  async updateProduct(updateDto: Product) {
    const { id } = updateDto;
    const product = await this.getProduct(id);
    if (!product) {
      return null;
    }

    try {
      const newProduct = Product.create({ ...product, ...updateDto });
      await Product.save(newProduct);
      return newProduct;
    } catch (error) {
      console.error(error);
      throw new RpcException(error.toString());
    }
  }

  async deleteProduct(productId: number) {
    const product = await this.getProduct(productId);
    if (!product) {
      return null;
    }

    await Product.softRemove(product);

    // 재고 서비스에 소프트 삭제 event로 요청
    this.stockClient.emit('stock_deleted', productId); // @EventPattern('stock_deleted')에서 받는다
    return true;
  }
}
