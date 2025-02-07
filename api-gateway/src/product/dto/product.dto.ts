import { Exclude, Expose, Type } from 'class-transformer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import { StockDto } from 'src/stock/dto/stock.dto';

class ProductPriceDTO extends Timestamp {
  @ApiProperty({ description: '기간' })
  @IsNumber()
  period: number;

  @ApiProperty({ description: '기간에 따른 가격' })
  @IsNumber()
  price: number;
}

export class ProductDTO {
  @ApiProperty({ description: '상품 ID', readOnly: true })
  @Expose()
  @IsOptional()
  id?: number;

  @ApiProperty({ description: '생성일', readOnly: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일', readOnly: true })
  updatedAt: Date;

  @ApiHideProperty()
  @Exclude()
  deletedAt: Date;

  @ApiProperty({ description: '섬네일' })
  @Expose()
  @IsString()
  thumbnailImage: string;

  @ApiProperty({ description: '상세 이미지' })
  @Expose()
  @IsOptional()
  @IsString()
  detailImage?: string;

  @ApiProperty({ description: '상품 타입' })
  @Expose()
  @IsString()
  productType: string;

  @ApiProperty({ description: '상품 이름' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: '상품 설명' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '상품 사용 유무' })
  @Expose()
  @IsBoolean()
  use: boolean;

  @ApiPropertyOptional({
    description: '상품 가격 리스트',
    type: ProductPriceDTO,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDTO)
  @ArrayMinSize(1)
  prices: ProductPriceDTO[];

  @Expose()
  @ValidateNested()
  @Type(() => StockDto)
  stock: StockDto;
}

export class CreateProductDTO extends OmitType(ProductDTO, [
  'id',
  'createdAt',
  'updatedAt',
]) {}

export class UpdateProductDTO extends PartialType(
  PickType(ProductDTO, [
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
