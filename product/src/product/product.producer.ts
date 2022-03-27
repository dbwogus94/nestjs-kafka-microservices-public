import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProducerService } from 'src/kafka/producer.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { ProductService } from './product.service';

@Injectable()
export class ProductProducer {
  constructor(
    private readonly configService: ConfigService,
    private readonly producerService: ProducerService,
    private readonly productService: ProductService,
  ) {}

  private toSendData(data: object) {
    return JSON.stringify(data);
  }

  /* ============ send kafka ============= */

  async sendCreateProduct(createDto: CreateProductDTO) {
    const value: string = this.toSendData({ createDto });
    await this.producerService.produce({
      topic: process.env.PRODUCT_CONSUMER_CREATE_TOPIC,
      messages: [{ value }],
    });
  }

  async sendUpdateProduct(productId: number, updateDto: UpdateProductDTO) {
    const product = await this.productService.getProduct(productId); // 외래키 까지 확인 필요?
    if (!product) {
      throw new NotFoundException();
    }

    const value: string = this.toSendData({ productId, updateDto });
    await this.producerService.produce({
      topic: process.env.PRODUCT_CONSUMER_UPDATE_TOPIC,
      messages: [{ value }],
    });
  }

  async sendDeleteProduct(productId: number) {
    const product = await this.productService.getProduct(productId);
    if (!product) {
      throw new NotFoundException();
    }

    const value: string = this.toSendData({ productId });
    await this.producerService.produce({
      topic: process.env.PRODUCT_CONSUMER_DELETE_TOPIC,
      messages: [{ value }],
    });
  }
  /* ========================== */
}
