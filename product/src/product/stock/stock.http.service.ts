import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceHost } from 'src/config/schema.config';
import { CustomHttpService } from 'src/custom-http/custom-http.service';

@Injectable()
export class StockHttpService {
  private readonly stockHost: string;

  constructor(
    private readonly configService: ConfigService,
    private httpService: CustomHttpService,
  ) {
    const { stockHost } = this.configService.get<ServiceHost>('serviceHost');
    this.stockHost = stockHost;
  }

  async callGetStock(productId: number) {
    return this.httpService.send(
      'get',
      `${this.stockHost}/${productId}/stocks`,
    );
  }

  async callPostStock(productId: number) {
    return this.httpService.send(
      'post',
      `${this.stockHost}/${productId}/stocks`,
    );
  }

  async callDeleteStock(productId: number): Promise<void> {
    await this.httpService.send(
      'delete',
      `${this.stockHost}/${productId}/stocks`,
    );
  }
}
