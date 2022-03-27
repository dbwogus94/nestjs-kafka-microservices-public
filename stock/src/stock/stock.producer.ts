import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProducerService } from 'src/kafka/producer.service';
import { CreateStockDto } from './stock.dto';
import { StockService } from './stock.service';

@Injectable()
export class StockProducer {
  private readonly logTag = 'StockProducer';

  constructor(
    private readonly producerService: ProducerService,
    private readonly stockService: StockService,
    private readonly configService: ConfigService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {}

  private toSendData(data: object) {
    return JSON.stringify(data);
  }

  async sendCreateStock(createDto: CreateStockDto) {
    const value: string = this.toSendData({ createDto });
    try {
      await this.producerService.produce({
        topic: process.env.STOCK_CONSUMER_CREATE_TOPIC,
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
      // TODO: 카프카 전송에러시 처리?
    }
  }

  async sendDeleteStock(productId: number) {
    await this.stockService.getStockByProductId(productId);

    try {
      const value: string = this.toSendData({ productId });
      await this.producerService.produce({
        topic: process.env.STOCK_CONSUMER_DELETE_TOPIC,
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
      // TODO: 카프카 전송에러시 처리?
    }
  }
}
