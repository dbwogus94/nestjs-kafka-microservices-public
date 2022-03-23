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
  @Expose()
  @IsOptional()
  @PrimaryGeneratedColumn()
  id?: number;

  @Expose()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
