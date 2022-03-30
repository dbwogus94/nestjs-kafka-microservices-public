import {
  GatewayTimeoutException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';
import { plainToInstance } from 'class-transformer';
import { StockDto } from './dto/stock.dto';

@Injectable()
export class StockHttpService {
  private readonly logTag = 'StockHttpService';
  private readonly axios: AxiosInstance;
  private readonly stockHost = 'http://localhost:3002/products';

  constructor(
    private httpService: HttpService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {
    this.axios = this.httpService.axiosRef;
  }

  // TODO: 가능하면 모듈화 시킬예정
  private async send(
    method: 'get' | 'post' | 'patch' | 'delete',
    url: string,
    body?: any,
  ) {
    if (method !== 'get') {
      url = url.includes('?')
        ? `${url}&sender=gateway`
        : `${url}?sender=gateway`;
    }

    try {
      const { data } = await this.axios.request({
        method,
        url,
        data: body,
        headers: { 'Content-Type': 'application/json' },
      });

      return data;
    } catch (error) {
      if (!error.response) {
        this.logger.error(error, error.stack, this.logTag);
        throw new GatewayTimeoutException(
          '내부 서비스에서 오류가 발생했습니다.',
        );
      }

      const { status } = error.response;
      if (status && status >= 400 && status <= 499) {
        throw new HttpException(void 0, status);
        // TODO: 예외 필터 || 인터셉터로 처리 필요
      }
    }
  }

  async callGetStock(productId: number): Promise<StockDto> {
    const data = await this.send(
      'get',
      `${this.stockHost}/${productId}/stocks`,
    );
    return plainToInstance(StockDto, data);
  }
}
