import { IsOptional, IsString, Matches } from 'class-validator';

export class SenderDTO {
  @IsOptional()
  @IsString()
  @Matches(/^gateway$/i)
  sender: 'gateway';
}
