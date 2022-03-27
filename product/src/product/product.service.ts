import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CreateProductDTO, UpdateProductDTO } from 'src/product/product.dto';
import { Product } from 'src/product/product.entity';
import { Connection } from 'typeorm';

@Injectable()
export class ProductService {
  private readonly logTag = 'AppService';

  // TODO: 모듈로 분리
  private readonly axios: AxiosInstance;
  private readonly stockHost = 'http://localhost:3002/stocks';
  private readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private httpService: HttpService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    // axiosRef는 순수 axios 인스턴스를 리턴한다.
    this.axios = this.httpService.axiosRef;
  }

  async getProducts() {
    return Product.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // TODO: 재고 서비스 완료되면 재고까지 한번에 조회하는 서비스 만들기
  async getProduct(productId: number) {
    const product = await Product.createQueryBuilder('product')
      .innerJoinAndSelect('product.prices', 'productPrice')
      .where('product.id = :productId', { productId })
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
    try {
      await Product.save(product);
      await this.axios.post(
        this.stockHost,
        { productId: product.id },
        this.axiosConfig,
      );

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

  async deleteProduct(productId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const product = await this.getProduct(productId);

    try {
      await Product.softRemove(product);

      // TODO: 재고 서비스에 재고 삭제 요청
      // => 재고 pk를 알지 못한다 그러면 DELETE 요청에 productId를 어떻게 넘길 수 있을까?
      // 방법 1. 상품코드없이 재고를 조회를 생각하지 않는다.
      // 방법 2. api를 DELETE products/1/stock 으로 만든다. (의미: 상품 1번의 재고를 삭제한다.)
      await this.axios.delete(
        `${this.stockHost}/${productId}`,
        this.axiosConfig,
      );

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
