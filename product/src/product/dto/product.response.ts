import { PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Product } from '../product.entity';

export class GetStockResponse {
  @Expose()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @Expose()
  @IsString()
  createdAt: string;

  @Expose()
  @IsString()
  updatedAt: string;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  normal: number;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  care: number;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  repair: number;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  waste: number;
}

export class GetProductResponse extends PickType(Product, [
  'id',
  'createdAt',
  'updatedAt',
  'thumbnailImage',
  'detailImage',
  'productType',
  'name',
  'description',
  'use',
  'prices',
]) {
  @Expose()
  @ValidateNested()
  @Type(() => GetStockResponse)
  stock?: GetStockResponse;
}
