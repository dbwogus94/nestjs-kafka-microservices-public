import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Timestamp } from 'src/common/entity/timestamp.entity';

export class StockDto extends Timestamp {
  @ApiProperty({ description: '일반 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  normal: number;

  @ApiProperty({ description: '케어 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  care: number;

  @ApiProperty({ description: '수리 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  repair: number;

  @ApiProperty({ description: '폐기 재고', readOnly: true })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  waste: number;
}
