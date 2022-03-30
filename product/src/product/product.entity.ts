import { Expose, Type } from 'class-transformer';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductPrice } from 'src/product/price/price.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('product')
export class Product extends Timestamp {
  @ApiProperty({ description: '섬네일' })
  @Expose()
  @Column('varchar', { comment: '섬네일' })
  @IsString()
  thumbnailImage: string;

  @ApiProperty({ description: '상세 이미지' })
  @Expose()
  @Column('varchar', { nullable: true, comment: '상세 이미지' })
  @IsOptional()
  @IsString()
  detailImage?: string;

  @ApiProperty({ description: '상품 타입' })
  @Expose()
  @Column('varchar', { comment: '상품 타입' })
  @IsString()
  productType: string;

  @ApiProperty({ description: '상품 이름' })
  @Expose()
  @Column('varchar', { nullable: true, comment: '상품 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '상품 설명' })
  @Expose()
  @Column('varchar', { nullable: true, comment: '상품 설명' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '상품 사용 유무' })
  @Expose()
  @IsBoolean()
  @Column('boolean', { comment: '상품 사용 유무' })
  use: boolean;

  @ApiPropertyOptional({
    description: '상품 가격 리스트',
    type: ProductPrice,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPrice) // **현재 설정에서 이 옵션이 없으면 배열에 필드를 부여한 형태로 할당됨, 또한 값을 인스턴스로 가지게 하려면 필수 항목이다.
  @ArrayMinSize(1)
  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product, {
    cascade: true,
  })
  prices: ProductPrice[];

  // 카프카 직열화에 사용된다.
  toString() {
    return JSON.stringify({ ...this });
  }
}
