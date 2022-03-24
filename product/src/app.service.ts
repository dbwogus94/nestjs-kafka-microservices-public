import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { catchError } from 'rxjs';
import { ProducerService } from './kafka/producer.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { Product } from './product.entity';

@Injectable()
export class AppService {
  private readonly logTag = 'AppService';
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
  ) {}

  private toSendData(data: object) {
    return JSON.stringify(data);
  }

  /* ============ send kafka ============= */

  async sendCreateProduct(createDto: CreateProductDTO) {
    const value: string = this.toSendData({ createDto });
    await this.producer.produce({
      topic: 'product_created',
      messages: [{ value }],
    });
  }

  async sendUpdateProduct(productId: number, updateDto: UpdateProductDTO) {
    const value: string = this.toSendData({ productId, updateDto });
    await this.producer.produce({
      topic: 'product_updated',
      messages: [{ value }],
    });
  }

  async sendDeleteProduct(productId: number) {
    const value: string = this.toSendData({ productId });
    await this.producer.produce({
      topic: 'product_deleted',
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
    const product = Product.create(createDto);

    try {
      await Product.save(product);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException(error);
    }

    // TODO: 재고 서비스에 재고 생성 axios로 요청 => 에러시 ??
    // this.httpService
    //   .post(
    //     this.stockHost,
    //     {
    //       productId: product.id,
    //     },
    //     this.axiosConfig,
    //   )
    //   .pipe(catchError((e) => this.logger.error(e, e.stack, this.logTag)))
    //   .subscribe();

    return product;
  }

  async updateProduct(productId: number, updateDto: UpdateProductDTO) {
    const product = await this.getProduct(productId);
    if (!product) {
      return null;
    }

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
    const product = await this.getProduct(productId);
    if (!product) {
      throw new NotFoundException();
    }

    await Product.softRemove(product);

    // TODO: 재고 서비스에 재고 삭제 요청 => 에러시 ??
    // this.httpService
    //   .delete(`${this.stockHost}/${productId}`, this.axiosConfig)
    //   .pipe(catchError((e) => this.logger.error(e, e.stack, this.logTag)))
    //   .subscribe();
  }
}
