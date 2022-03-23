import { Type } from 'class-transformer';
import { PartialType, PickType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateProductDTO {
  @IsString()
  thumbnailImage: string;

  @IsOptional()
  @IsString()
  detailImage?: string;

  @IsString()
  productType: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  use: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductPriceDTO)
  prices: CreateProductPriceDTO[];

  toString() {
    return JSON.stringify({
      ...this,
    });
  }
}

class CreateProductPriceDTO {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  period: number;

  @IsNumber()
  price: number;
}

export class UpdateProductDTO extends PartialType(
  PickType(CreateProductDTO, [
    'thumbnailImage',
    'detailImage',
    'productType',
    'description',
    'use',
    'prices',
  ]),
) {}
