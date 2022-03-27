import { PickType } from '@nestjs/swagger';
import { Stock } from './stock.entity';

export class CreateStockDto extends PickType(Stock, ['productId']) {}

export class DeleteStockDto extends PickType(Stock, ['productId']) {}
