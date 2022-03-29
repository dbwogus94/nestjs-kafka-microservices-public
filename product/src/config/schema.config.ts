import { InfoObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @ValidateNested()
  @Type(() => DatabaseCliConfig)
  cli: DatabaseCliConfig = new DatabaseCliConfig();
  // Q) 인스턴스화가 필요한 경우?
  // A) local.config에 객체로 선언되어 있지 않은 경우 인스턴스화를 명시적으로 해야한다.
}

export class ConsumerTopicConfig implements ConsumerSubscribeTopic {
  @IsNotEmpty()
  @IsString()
  topic: string | RegExp;

  @IsBoolean()
  @IsOptional()
  fromBeginning?: boolean;
}

export class ConsumerGroupConfig {
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConsumerTopicConfig)
  topics: ConsumerTopicConfig[]; // 그룹에 사용할 토픽들 설정

  @IsOptional()
  consumerRunConfig?: ConsumerRunConfig; // 그룹이 사용할 autoCommit 정책등 설정
}

export class KafkaConfig {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  brokers: string[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConsumerGroupConfig)
  product: ConsumerGroupConfig;
}

export class SwaggerInfo implements InfoObject {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  version = '1.0';
}

export class SwaggerConfig {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerInfo)
  product: SwaggerInfo;
}

/**
 * BaseConfig를 상속하는 SchemaConfig 클래스
 */
export class SchemaConfig extends BaseConfig {
  @IsNumber()
  @IsNotEmpty()
  readonly port: number = 80;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DatabaseConfig)
  readonly database: DatabaseConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => KafkaConfig)
  readonly kafka: KafkaConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerConfig)
  readonly swagger: SwaggerConfig;
}
