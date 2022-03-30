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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomHttpService {
  private readonly logTag = 'CustomHttpService';
  private readonly axios: AxiosInstance;

  constructor(
    private httpService: HttpService,
    @Inject(Logger)
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.axios = this.httpService.axiosRef;
  }

  public async send(
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
      const { status, statusText } = error.response;
      throw new HttpException(statusText, status);
      // TODO: 게이트웨이는 예외 필터 || 인터셉터로 처리 필요
      // if (status && status >= 500 && status <= 599) { }
      // if (status && status >= 400 && status <= 499) { }
    }
  }
}
