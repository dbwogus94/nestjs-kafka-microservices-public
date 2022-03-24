import { Injectable, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AppService } from './app.service';
import { ConsumerService } from './kafka/consumer.service';
import { CreateStockDto, DeleteStockDto } from './stock.dto';

@Injectable()
export class StockConsumer implements OnModuleInit {
  private readonly consumerGroup = 'stock-consumer';

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
    try {
      await Promise.all([
        this.consumerService.consume(
          { groupId: this.consumerGroup },
          { topic: 'stock_created' },
          {
            eachMessage: async ({ message }) =>
              this.createCunsume(message.value.toString()),
          },
        ),
        // TODO: 동시에 여러개를 등록하면 토픽은 생성되지만 컨슈머 그룹이 할당되지 않는 문제 있음...
        // this.consumerService.consume(
        // this.consumerService.consume(
        //   { groupId: this.consumerGroup },
        //   { topic: 'stock_deleted' },
        //   {
        //     eachMessage: async ({ message }) =>
        //       this.deleteCunsume(message.value.toString()),
        //   },
        // ),
      ]);
    } catch (error) {
      console.error(error);
    }
  }
}
