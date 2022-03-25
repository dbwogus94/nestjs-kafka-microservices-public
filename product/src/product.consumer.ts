import { Injectable, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AppService } from './app.service';
import { ConsumerService } from './kafka/consumer.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

@Injectable()
export class ProductConsumer implements OnModuleInit {
  constructor(
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
    const topics = [
      { topic: 'product_created' },
      { topic: 'product_updated' },
      { topic: 'product_deleted' },
    ];

    try {
      await this.consumerService.consume(
        { groupId: 'product-consumer' },
        topics,
        {
          eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
              case 'product_created':
                return this.createCunsume(message.value.toString());
              case 'product_updated':
                return this.updateCunsume(message.value.toString());
              case 'product_deleted':
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
