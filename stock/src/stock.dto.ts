import { IsNumber } from 'class-validator';

export class CreateStockDto {
  @IsNumber()
  productId: number;
}

export class DeleteStockDto {
  @IsNumber()
  productId: number;
}
