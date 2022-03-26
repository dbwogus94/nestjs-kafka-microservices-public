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
import { Connection } from 'typeorm';
import { ProducerService } from './kafka/producer.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { Product } from './product.entity';

@Injectable()
export class AppService {
  private readonly logTag = 'AppService';

  // TODO: 설정으로
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
    private readonly producer: ProducerService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    // axiosRef는 순수 axios 인스턴스를 리턴한다.
    this.axios = this.httpService.axiosRef;
  }

  private toSendData(data: object) {
    return JSON.stringify(data);
  }

  /* ============ send kafka ============= */

  async sendCreateProduct(createDto: CreateProductDTO) {
    const value: string = this.toSendData({ createDto });
    await this.producer.produce({
      topic: process.env.PRODUCT_CONSUMER_CREATE_TOPIC,
      messages: [{ value }],
    });
  }

  async sendUpdateProduct(productId: number, updateDto: UpdateProductDTO) {
    const product = await this.getProduct(productId); // 가격 정보
    if (!product) {
      throw new NotFoundException();
    }

    const value: string = this.toSendData({ productId, updateDto });
    await this.producer.produce({
      topic: process.env.PRODUCT_CONSUMER_UPDATE_TOPIC,
      messages: [{ value }],
    });
  }

  async sendDeleteProduct(productId: number) {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new NotFoundException();
    }

    const value: string = this.toSendData({ productId });
    await this.producer.produce({
      topic: process.env.PRODUCT_CONSUMER_DELETE_TOPIC,
      messages: [{ value }],
    });
  }
  /* ========================== */

  async getProducts() {
    return Product.find();
  }

  async getProduct(productId: number) {
    return Product.createQueryBuilder('product')
      .innerJoinAndSelect('product.prices', 'productPrice')
      .where('product.id = :productId', { productId })
      .getOne();
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
      throw new InternalServerErrorException(error);
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
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProduct(productId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const product = await this.getProduct(productId); // TODO: 조회 하지 말고 pk 삭제로 변경하자.
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
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
