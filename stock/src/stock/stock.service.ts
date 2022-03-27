import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { Stock } from './stock.entity';

@Injectable()
export class StockService {
  private readonly logTag = 'StockService';

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {}

  async getStockByProductId(productId: number) {
    const stock = await Stock.findOne({ where: { productId } });

    if (!stock) {
      throw new NotFoundException();
    }

    return stock;
  }

  async createStock(productId: number) {
    const stock = Stock.create({ productId });
    try {
      await Stock.save(stock);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw new InternalServerErrorException();
    }
  }

  async deleteStock(productId: number) {
    const stock = await this.getStockByProductId(productId);
    await stock.softRemove();
  }
}
