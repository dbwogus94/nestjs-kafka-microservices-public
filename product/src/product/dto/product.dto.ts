import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { Product } from '../product.entity';

export class CreateProductDTO extends OmitType(Product, ['id']) {}

export class UpdateProductDTO extends PartialType(
  PickType(Product, [
    'thumbnailImage',
    'detailImage',
    'productType',
    'description',
    'use',
    'prices',
  ]),
) {}

export class searchOptionDTO {
  @ApiProperty({
    required: false,
    description: '조회결과에 연관된 데이터를 포함하도록 요청',
    example: 'stocks',
  })
  @IsOptional()
  @IsString()
  @Matches(/^stocks$/i)
  include: 'stocks';
}
