import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { ServiceHost } from 'src/config/schema.config';
import { CustomHttpService } from 'src/custom-http/custom-http.service';
import {
  CreateProductDTO,
  ProductDTO,
  UpdateProductDTO,
} from './dto/product.dto';

@Injectable()
export class ProductHttpService {
  private readonly productHost: string;

  constructor(
    private httpService: CustomHttpService,
    private configService: ConfigService,
  ) {
    const { productHost } = this.configService.get<ServiceHost>('serviceHost');
    this.productHost = productHost;
  }

  async callGetProducts(): Promise<ProductDTO[]> {
    const data: unknown[] = await this.httpService.send(
      'get',
      `${this.productHost}`,
    );

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

    const data = await this.httpService.send('get', url);
    return plainToInstance(ProductDTO, data, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });
  }

  async callPostProduct(body: CreateProductDTO): Promise<ProductDTO> {
    const data = await this.httpService.send(
      'post',
      `${this.productHost}`,
      body,
    );

    return plainToInstance(ProductDTO, data, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });
  }

  async callPatchProduct(
    productId: number,
    body: UpdateProductDTO,
  ): Promise<ProductDTO> {
    const data = await this.httpService.send(
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
    await this.httpService.send('delete', `${this.productHost}/${productId}`);
  }
}
