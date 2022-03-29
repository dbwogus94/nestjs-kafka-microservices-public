import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class SenderDTO {
  @ApiProperty({ description: '내/외부 통신 구분 옵션', default: 'gateway' })
  @IsOptional()
  @IsString()
  @Matches(/^gateway$/i)
  sender: 'gateway';
}
