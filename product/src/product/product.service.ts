import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateProductDTO, UpdateProductDTO } from 'src/product/product.dto';
import { Product } from 'src/product/product.entity';
import { Connection } from 'typeorm';
import { GetProductResponse } from './dto/product.response';
import { StockHttpService } from './stock/stock.http.service';

@Injectable()
export class ProductService {
  private readonly logTag = 'ProductService';

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly stockService: StockHttpService,
  ) {}

  async getProducts() {
    return Product.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getProductWithStock(productId: number): Promise<GetProductResponse> {
    const product = await this.getProduct(productId);

    try {
      const stock = await this.stockService.callGetStock(productId);

      return plainToInstance(
        GetProductResponse,
        { ...product, stock },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
    }
  }

  async getProduct(productId: number) {
    const product = await Product.createQueryBuilder('product')
      .innerJoinAndSelect('product.prices', 'productPrice')
      .where('product.id = :productId', { productId })
      .orderBy('productPrice.period', 'ASC')
      .getOne();

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  async createProduct(createDto: CreateProductDTO) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const product = Product.create(createDto);
    // 가격 정보도 비교
    try {
      const { id } = await Product.save(product);
      await this.stockService.callPostStock(id);

      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
    return product;
  }

  async updateProduct(productId: number, updateDto: UpdateProductDTO) {
    const product = await this.getProduct(productId);

    try {
      const newProduct = Product.create({ ...product, ...updateDto });
      await Product.save(newProduct);
      return newProduct;
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const product = await this.getProduct(productId);

    try {
      await Product.softRemove(product);

      await this.stockService.callDeleteStock(productId);

      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
