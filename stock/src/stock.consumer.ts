import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { AppService } from './app.service';
import { KafkaConfig } from './config/schema.config';
import { ConsumerService } from './kafka/consumer.service';
import { CreateStockDto } from './stock.dto';

@Injectable()
export class StockConsumer implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
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
    const { stock } = this.configService.get<KafkaConfig>('kafka');
    const { groupName, topics } = stock;

    try {
      await this.consumerService.consume(
        { groupId: groupName }, //
        topics,
        {
          eachMessage: async ({ topic, partition, message }) => {
            switch (topic) {
              case process.env.STOCK_CONSUMER_CREATE_TOPIC:
                return this.createCunsume(message.value.toString());
              case process.env.STOCK_CONSUMER_DELETE_TOPIC:
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
