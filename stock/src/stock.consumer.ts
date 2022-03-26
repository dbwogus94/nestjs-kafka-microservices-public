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
    const { groupId, topics } = stock;

    try {
      await this.consumerService.consume(
        { groupId }, //
        topics,
        {
          eachMessage: async ({ topic, partition, message }) => {
            try {
              switch (topic) {
                case process.env.STOCK_CONSUMER_CREATE_TOPIC:
                  await this.createCunsume(message.value.toString());
                  break;
                case process.env.STOCK_CONSUMER_DELETE_TOPIC:
                  await this.deleteCunsume(message.value.toString());
                  break;
                default:
                  throw new Error(`Not Found Topic(${topic}) Handler`);
              }
            } catch (error) {
              console.error(error);
              // throw error;
              return;
              // TODO: autoCommit 비활성화시 에러를 던지지 않으면 메세지는 처리한 것으로 취급된다.
              // 에러 처리를 어떻게 해야할지 연구가 필요하다.
            }
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
  }
}
