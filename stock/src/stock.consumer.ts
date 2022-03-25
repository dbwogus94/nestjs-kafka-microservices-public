import { Injectable, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AppService } from './app.service';
import { ConsumerService } from './kafka/consumer.service';
import { CreateStockDto } from './stock.dto';

@Injectable()
export class StockConsumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly appService: AppService,
  ) {}

  private async createCunsume(value: string) {
    const { createDto } = JSON.parse(value);
    await this.appService.createStock(
      plainToInstance(CreateStockDto, createDto),
    );
  }

  private async deleteCunsume(value: string) {
    const { productId } = JSON.parse(value);
    await this.appService.deleteStock(productId);
  }

  async onModuleInit() {
    const topics = [{ topic: 'stock_created' }, { topic: 'stock_deleted' }];
    try {
      await this.consumerService.consume(
        { groupId: 'stock-consumer' },
        topics,
        {
          eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
              case 'stock_created':
                return this.createCunsume(message.value.toString());
              case 'stock_deleted':
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
