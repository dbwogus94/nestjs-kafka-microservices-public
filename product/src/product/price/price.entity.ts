import { Exclude, Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import { Product } from 'src/product/product.entity';

@Entity('product_price')
@Unique('product_period', ['product', 'period'])
export class ProductPrice extends Timestamp {
  @Exclude()
  @ManyToOne(() => Product, (product) => product.prices)
  product: Product;

  @Expose()
  @Column('integer')
  @IsNumber()
  period: number;

  @Expose()
  @IsNumber()
  @Column('integer')
  price: number;
}
