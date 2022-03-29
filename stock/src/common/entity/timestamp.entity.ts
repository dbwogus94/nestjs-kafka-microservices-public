import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Timestamp extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @Expose()
  @IsOptional()
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ readOnly: true })
  @Expose()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ readOnly: true })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // @ApiProperty({ readOnly: true })  // readOnly: true => 스웨거 body에 노출 안됨
  @ApiHideProperty()
  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
