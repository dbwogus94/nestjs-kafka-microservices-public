import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Product } from '../product.entity';

export class GetStockResponse {
  @ApiProperty({ description: '재고 ID', readOnly: true })
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

  @ApiProperty({ description: '일반 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  normal: number;

  @ApiProperty({ description: '케어 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  care: number;

  @ApiProperty({ description: '수리 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  repair: number;

  @ApiProperty({ description: '폐기 재고', readOnly: true })
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
  @ApiPropertyOptional({
    description: '상품 재고 정보',
    readOnly: true,
    type: GetStockResponse,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GetStockResponse)
  stock?: GetStockResponse;
}
