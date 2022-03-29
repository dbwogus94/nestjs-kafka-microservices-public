import { Exclude, Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import { Product } from 'src/product/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('product_price')
@Unique('product_period', ['product', 'period'])
export class ProductPrice extends Timestamp {
  // @ApiProperty({ description: '상품 사용 유무', readOnly: true })
  @Exclude()
  @ManyToOne(() => Product, (product) => product.prices)
  product: Product;

  @ApiProperty({ description: '기간' })
  @Expose()
  @Column('integer', { comment: '기간' })
  @IsNumber()
  period: number;

  @ApiProperty({ description: '기간에 따른 가격' })
  @Expose()
  @IsNumber()
  @Column('integer', { comment: '기간에 따른 가격' })
  price: number;
}
