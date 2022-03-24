import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { ProducerService } from './kafka/producer.service';
import { CreateStockDto, DeleteStockDto } from './stock.dto';
import { Stock } from './stock.entity';

@Injectable()
export class AppService {
  private readonly logTag = 'AppService';

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private readonly producer: ProducerService,
  ) {}

  private toSendData(data: object) {
    return JSON.stringify(data);
  }

  async sendCreateStock(createDto: CreateStockDto) {
    const value: string = this.toSendData({ createDto });
    try {
      await this.producer.produce({
        topic: 'stock_created',
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException(error);
      // 카프카 전송에러시 처리
    }
  }

  async sendDeleteStock(productId: number) {
    try {
      const value: string = this.toSendData({ productId });
      await this.producer.produce({
        topic: 'stock_deleted',
        messages: [{ value }],
      });
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException(error);
      // 카프카 전송에러시 처리
    }
  }

  /* ============ send kafka end ============= */

  async createStock(createDto: CreateStockDto) {
    const { productId } = createDto;
    const stock = Stock.create({ productId });
    try {
      await Stock.save(stock);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteStock(productId: number) {
    const stock = await Stock.findOne({ where: { productId } });

    if (!stock) {
      throw new NotFoundException();
    }

    await stock.softRemove();
  }
}
