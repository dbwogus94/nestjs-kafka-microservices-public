import { Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('stock')
export class Stock extends Timestamp {
  @ApiProperty({ description: '정상 재고' })
  @Expose()
  @Column('integer', { default: 0, comment: '정상 재고' })
  @Type(() => Number)
  @IsNumber()
  normal: number;

  @ApiProperty({ description: '커어 대기 재고' })
  @Expose()
  @Column('integer', { default: 0, comment: '커어 대기 재고' })
  @Type(() => Number)
  @IsNumber()
  care: number;

  @ApiProperty({ description: '수리 대기 재고' })
  @Expose()
  @Column('integer', { default: 0, comment: '수리 대기 재고' })
  @Type(() => Number)
  @IsNumber()
  repair: number;

  @ApiProperty({ description: '폐기된 제고' })
  @Expose()
  @Column('integer', { default: 0, comment: '폐기된 제고' })
  @Type(() => Number)
  @IsNumber()
  waste: number;

  @ApiProperty({ description: '상품 id(unique)' })
  @Expose()
  @Column('integer', { comment: '상품 id', unique: true })
  @Type(() => Number)
  @IsNumber()
  productId: number;
}
