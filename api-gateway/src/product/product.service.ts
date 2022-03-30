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
import { CreateProductDTO } from './product.dto';

@Injectable()
export class ProductHttpService {
  private readonly logTag = 'ProductHttpService';
  private readonly axios: AxiosInstance;
  private readonly productHost = 'http://localhost:3001/products';

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
      if (!status && status >= 400 && status <= 499) {
        throw new HttpException(void 0, error.response.status);
        // TODO: 예외 필터 || 인터셉터로 처리 필요
      }
    }
  }

  async callGetProducts() {
    return this.send('get', `${this.productHost}`);
  }

  async callGetProduct(productId: number, include?: 'stocks') {
    const url = include
      ? `${this.productHost}/${productId}?include=${include}`
      : `${this.productHost}/${productId}`;
    // TODO: include 배열로 수정
    return this.send('get', url);
  }

  async callPostProduct(body: CreateProductDTO) {
    return this.send('post', `${this.productHost}`, body);
  }

  // async callPatchProduct(productId: number) {
  //   return this.send('patch', `${this.productHost}/${productId}`);
  // }

  // async callDeleteProduct(productId: number) {
  //   return this.send('delete', `${this.productHost}/${productId}`);
  // }
}
