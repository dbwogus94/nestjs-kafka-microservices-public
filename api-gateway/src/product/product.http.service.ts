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
import {
  CreateProductDTO,
  ProductDTO,
  UpdateProductDTO,
} from './dto/product.dto';
import { plainToInstance } from 'class-transformer';

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
      if (status && status >= 400 && status <= 499) {
        throw new HttpException(void 0, status);
        // TODO: 예외 필터 || 인터셉터로 처리 필요
      }
    }
  }

  async callGetProducts(): Promise<ProductDTO[]> {
    const data: unknown[] = await this.send('get', `${this.productHost}`);

    return plainToInstance(ProductDTO, data, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });
  }

  async callGetProduct(
    productId: number,
    include?: 'stocks' | 'logistics' | 'stocks,logistics' | 'logistics,stocks', // 개선 필요
  ): Promise<ProductDTO> {
    const url = !!include
      ? `${this.productHost}/${productId}?include=${include}`
      : `${this.productHost}/${productId}`;

    const data = await this.send('get', url);
    return plainToInstance(ProductDTO, data, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });
  }

  async callPostProduct(body: CreateProductDTO): Promise<ProductDTO> {
    const data = await this.send('post', `${this.productHost}`, body);

    return plainToInstance(ProductDTO, data, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });
  }

  async callPatchProduct(
    productId: number,
    body: UpdateProductDTO,
  ): Promise<ProductDTO> {
    const data = await this.send(
      'patch',
      `${this.productHost}/${productId}`,
      body,
    );

    return plainToInstance(ProductDTO, data, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });
  }

  async callDeleteProduct(productId: number): Promise<void> {
    await this.send('delete', `${this.productHost}/${productId}`);
  }
}
