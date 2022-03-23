import { Expose } from 'class-transformer';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductPrice } from 'src/price/price.entity';

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
  @ArrayMinSize(1)
  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product, {
    cascade: true,
  })
  prices: ProductPrice[];

  toString() {
    return JSON.stringify({ ...this });
  }
}
