import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { AppService } from './app.service';
import { KafkaConfig } from './config/schema.config';
import { ConsumerService } from './kafka/consumer.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

@Injectable()
export class ProductConsumer implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly consumerService: ConsumerService,
    private readonly appService: AppService,
  ) {}

  private async createCunsume(value: string) {
    const { createDto } = JSON.parse(value);
    await this.appService.createProduct(
      plainToInstance(CreateProductDTO, createDto),
    );
  }

  private async updateCunsume(value: string) {
    const { productId, updateDto } = JSON.parse(value);
    await this.appService.updateProduct(
      productId,
      plainToInstance(UpdateProductDTO, updateDto),
    );
  }

  private async deleteCunsume(value: string) {
    const { productId } = JSON.parse(value);
    await this.appService.deleteProduct(productId);
  }

  // TODO: 로직 개선예정
  async onModuleInit() {
    const { product } = this.configService.get<KafkaConfig>('kafka');
    const { groupName, topics } = product;

    try {
      await this.consumerService.consume(
        { groupId: groupName }, //
        topics,
        {
          // TODO: topic 하드코딩 개선 예정
          eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
              case process.env.PRODUCT_CONSUMER_CREATE_TOPIC:
                return this.createCunsume(message.value.toString());
              case process.env.PRODUCT_CONSUMER_UPDATE_TOPIC:
                return this.updateCunsume(message.value.toString());
              case process.env.PRODUCT_CONSUMER_DELETE_TOPIC:
                return this.deleteCunsume(message.value.toString());
            }
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
  }
}
