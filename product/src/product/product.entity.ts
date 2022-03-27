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

@Entity('product')
export class Product extends Timestamp {
  @Expose()
  @Column('varchar')
  @IsString()
  thumbnailImage: string;

  @Expose()
  @Column('varchar', { nullable: true })
  @IsOptional()
  @IsString()
  detailImage?: string;

  @Expose()
  @Column('varchar')
  @IsString()
  productType: string;

  @Expose()
  @Column('varchar', { nullable: true })
  @IsString()
  name: string;

  @Expose()
  @Column('varchar', { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsBoolean()
  @Column('boolean')
  use: boolean;

  @Expose()
  @IsArray()
  @Type(() => ProductPrice) // **현재 설정에서 이 옵션이 없으면 배열에 필드를 부여한 형태로 할당됨, 또한 값을 인스턴스로 가지게 하려면 필수 항목이다.
  @ArrayMinSize(1)
  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product, {
    cascade: true,
  })
  prices: ProductPrice[];

  toString() {
    return JSON.stringify({ ...this });
  }
}
