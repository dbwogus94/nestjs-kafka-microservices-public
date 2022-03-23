import { Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Timestamp } from 'src/common/entity/timestamp.entity';
// import { Product } from 'src/product.entity';

@Entity('stock')
export class Stock extends Timestamp {
  @Expose()
  @Column('integer', { default: 0, comment: '정상 재고' })
  @Type(() => Number)
  @IsNumber()
  normal: number;

  @Expose()
  @Column('integer', { default: 0, comment: '커어 대기 재고' })
  @Type(() => Number)
  @IsNumber()
  care: number;

  @Expose()
  @Column('integer', { default: 0, comment: '수리 대기 재고' })
  @Type(() => Number)
  @IsNumber()
  repair: number;

  @Expose()
  @Column('integer', { default: 0, comment: '폐기된 제고' })
  @Type(() => Number)
  @IsNumber()
  waste: number;

  @Expose()
  @Column('integer', { comment: '상품 id, (FK)' })
  @Type(() => Number)
  @IsNumber()
  productId: number;

  // @Expose()
  // @OneToOne('Product')
  // @JoinColumn()
  // product: Product;
}
