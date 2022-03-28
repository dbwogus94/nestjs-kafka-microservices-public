import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { EachMessagePayload } from 'kafkajs';
import { KafkaConfig } from 'src/config/schema.config';
import { ConsumerService } from 'src/kafka/consumer.service';
import { CreateProductDTO, UpdateProductDTO } from 'src/product/product.dto';
import { ProductService } from './product.service';

@Injectable()
export class ProductConsumer implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly consumerService: ConsumerService,
    private readonly productService: ProductService,
  ) {}

  private async createCunsume(value: string) {
    const { createDto } = JSON.parse(value);
    await this.productService.createProduct(
      plainToInstance(CreateProductDTO, createDto),
    );
  }

  private async updateCunsume(value: string) {
    const { productId, updateDto } = JSON.parse(value);
    await this.productService.updateProduct(
      productId,
      plainToInstance(UpdateProductDTO, updateDto),
    );
  }

  private async deleteCunsume(value: string) {
    const { productId } = JSON.parse(value);
    await this.productService.deleteProduct(productId);
  }

  // TODO: 로직 개선예정
  async onModuleInit() {
    const { product } = this.configService.get<KafkaConfig>('kafka');
    const { groupId, topics } = product;

    try {
      await this.consumerService.consume(
        { groupId }, //
        topics,
        {
          autoCommit: false, // => 기본 true
          eachMessage: async (recode: EachMessagePayload) => {
            const { topic, message } = recode;
            try {
              switch (topic) {
                case process.env.PRODUCT_CONSUMER_CREATE_TOPIC:
                  await this.createCunsume(message.value.toString());
                  break;
                case process.env.PRODUCT_CONSUMER_UPDATE_TOPIC:
                  await this.updateCunsume(message.value.toString());
                  break;
                case process.env.PRODUCT_CONSUMER_DELETE_TOPIC:
                  await this.deleteCunsume(message.value.toString());
                  break;
                default:
                  throw new Error(`Not Found Topic(${topic}) Handler`);
              }
            } catch (error) {
              /* autoCommit을 활성화 하는 경우: 아래 리턴을 사용*/
              // return;
              // TODO: 에러를 던지지 않으면 메세지는 처리한 것으로 취급된다.
              // 에러 처리를 어떻게 해야할지 연구가 필요하다.
            } finally {
              /* autoCommit을 비활성화 하는 경우: 아래 메서드를 사용한다. */
              await this.consumerService.commitOffset(groupId, recode);
            }
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
  }
}
