import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Timestamp } from 'src/common/entity/timestamp.entity';
import { Column, Entity } from 'typeorm';

@Entity('user')
export class User extends Timestamp {
  @ApiProperty({ description: '로그인 ID', uniqueItems: true })
  @Expose()
  @Column('varchar', { unique: true, comment: '로그인 ID' })
  username: string;

  @ApiProperty({ description: '패스워드' })
  @Exclude()
  @Column('varchar', { comment: '패스워드' })
  @IsString()
  password: string;

  @ApiProperty({ description: '사용 유무' })
  @Expose()
  @Column('boolean', { default: true, comment: '사용 유무' })
  @IsBoolean()
  use: boolean;

  @ApiHideProperty()
  @Exclude()
  @Column('varchar', { nullable: true, comment: '엑세스 토큰' })
  @IsOptional()
  accessToken?: string;

  @ApiHideProperty()
  @Exclude()
  @Column('varchar', { nullable: true, comment: '리프레시 토큰' })
  @IsOptional()
  refreshToken?: string;
}
