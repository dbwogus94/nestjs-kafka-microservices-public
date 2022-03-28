import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class StockHttpService {
  private readonly axios: AxiosInstance;
  private readonly stockHost = 'http://localhost:3002/products';
  private readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  constructor(private httpService: HttpService) {
    // axiosRef는 순수 axios 인스턴스를 리턴한다.
    this.axios = this.httpService.axiosRef;
  }

  async callGetStock(productId: number) {
    const { status, data } = await this.axios.get(
      `${this.stockHost}/${productId}/stocks`,
      this.axiosConfig,
    );

    if (status !== 200) {
      throw new Error('통신 에러!');
    }

    return data;
  }

  async callPostStock(productId: number): Promise<void> {
    const { status } = await this.axios.post(
      `${this.stockHost}/${productId}/stocks`,
      // {},
      this.axiosConfig,
    );

    if (status !== 201) {
      throw new Error('통신 에러!');
    }
  }

  async callDeleteStock(productId: number): Promise<void> {
    const { status } = await this.axios.delete(
      `${this.stockHost}/${productId}/stocks`,
      this.axiosConfig,
    );

    if (status !== 204) {
      throw new Error('통신 에러!');
    }
  }
}
