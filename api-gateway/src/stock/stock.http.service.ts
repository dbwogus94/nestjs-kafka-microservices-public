import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { ServiceHost } from 'src/config/schema.config';
import { CustomHttpService } from 'src/custom-http/custom-http.service';
import { StockDto } from './dto/stock.dto';

@Injectable()
export class StockHttpService {
  private readonly stockHost: string;

  constructor(
    private httpService: CustomHttpService,
    private configService: ConfigService,
  ) {
    const { stockHost } = this.configService.get<ServiceHost>('serviceHost');
    this.stockHost = stockHost;
  }

  async callGetStock(productId: number): Promise<StockDto> {
    const data = await this.httpService.send(
      'get',
      `${this.stockHost}/${productId}/stocks`,
    );
    return plainToInstance(StockDto, data);
  }
}
