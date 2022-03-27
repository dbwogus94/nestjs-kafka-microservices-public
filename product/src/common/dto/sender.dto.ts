import { IsOptional, IsString } from 'class-validator';

export class SenderDTO {
  @IsOptional()
  @IsString()
  // 정규식 추가 하자
  sender: 'gateway';
}
