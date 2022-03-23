import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

import { BaseConfig } from './base.config';

export class KafkaConfig {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  brokers: string[];
}

/**
 * BaseConfig를 상속하는 SchemaConfig 클래스
 */
export class SchemaConfig extends BaseConfig {
  @IsNumber()
  @IsNotEmpty()
  readonly port: number = 8080;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => KafkaConfig)
  readonly kafka: KafkaConfig = new KafkaConfig();
}
