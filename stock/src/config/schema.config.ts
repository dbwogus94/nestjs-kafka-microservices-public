import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConsumerRunConfig, ConsumerSubscribeTopic } from 'kafkajs';
import { LoggerOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { BaseConfig } from './base.config';

class DatabaseCliConfig {
  @IsString()
  @IsNotEmpty()
  migrationsDir = 'src/migrations';
}

export class DatabaseConfig implements PostgresConnectionOptions {
  @IsString()
  @IsNotEmpty()
  type: 'postgres' = 'postgres';

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  @IsNotEmpty()
  port = 5432;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  database: string;

  @IsBoolean()
  @IsNotEmpty()
  ssl = false;

  @IsArray()
  @IsNotEmpty()
  entities: string[] = [`${__dirname}/../**/*.entity{.ts,.js}`];

  @IsArray()
  @IsNotEmpty()
  migrations: string[] = [`${__dirname}/../migrations/**/*{.ts,.js}`];

  @IsBoolean()
  @IsNotEmpty()
  synchronize = false;

  @IsBoolean()
  @IsNotEmpty()
  dropSchema = false;

  @IsBoolean()
  @IsNotEmpty()
  migrationsRun = false;

  @IsString()
  @IsNotEmpty()
  migrationsTableName = 'migrations';

  @IsNotEmpty()
  logging: LoggerOptions = 'all';

  @IsNotEmpty()
  cli: DatabaseCliConfig = new DatabaseCliConfig();
}

export class ConsumerGroupConfig {
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  topics: ConsumerSubscribeTopic[]; // 그룹에 사용할 토픽들 설정

  consumerRunConfig?: ConsumerRunConfig; // 그룹이 사용할 autoCommit 정책등 설정
}

export class KafkaConfig {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  brokers: string[];

  @IsNotEmpty()
  @ValidateNested()
  stock: ConsumerGroupConfig; // 상품 컨슈머 그룹 설정
}

export class SwaggerConfig {
  title: string;
  description: string;
  version = '1.0';
}

/**
 * BaseConfig를 상속하는 SchemaConfig 클래스
 */
export class SchemaConfig extends BaseConfig {
  @IsNumber()
  @IsNotEmpty()
  readonly port: number = 80;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => DatabaseConfig)
  readonly database: DatabaseConfig = new DatabaseConfig();

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => KafkaConfig)
  readonly kafka: KafkaConfig = new KafkaConfig();

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerConfig)
  readonly swagger: SwaggerConfig = new SwaggerConfig();
}
