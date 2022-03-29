import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProducerService } from 'src/kafka/producer.service';
import { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';
import { ProductService } from './product.service';

@Injectable()
export class ProductProducer {
  private readonly logTag = 'ProductProducer';

  constructor(
    private readonly producerService: ProducerService,
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {}

  private toSendData(data: any) {
    return JSON.stringify(data);
  }

  async sendCreateProduct(createDto: CreateProductDTO) {
    const value: string = this.toSendData({ createDto });
    try {
      await this.producerService.produce({
        topic: process.env.PRODUCT_CONSUMER_CREATE_TOPIC,
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
    }
  }

  async sendUpdateProduct(productId: number, updateDto: UpdateProductDTO) {
    await this.productService.getProduct(productId); // 외래키 까지 확인 필요?

    try {
      const value: string = this.toSendData({ productId, updateDto });
      await this.producerService.produce({
        topic: process.env.PRODUCT_CONSUMER_UPDATE_TOPIC,
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
    }
  }

  async sendDeleteProduct(productId: number) {
    await this.productService.getProduct(productId);

    try {
      const value: string = this.toSendData({ productId });
      await this.producerService.produce({
        topic: process.env.PRODUCT_CONSUMER_DELETE_TOPIC,
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
    }
  }
}
