import { InfoObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
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

  // @IsNotEmpty()
  // namingStrategy: CustomNamingStrategy = new CustomNamingStrategy();
}

export class JwtInfo {
  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @IsString()
  expiration: string;
}

export class JwtConfig {
  @IsNotEmpty()
  @IsString()
  issuer: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => JwtInfo)
  access: JwtInfo;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => JwtInfo)
  refresh: JwtInfo;
}

export class ServiceHost {
  @IsNotEmpty()
  @IsString()
  productHost: string;

  @IsNotEmpty()
  @IsString()
  stockHost: string;
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
  apis: SwaggerInfo;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerInfo)
  product: SwaggerInfo;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerInfo)
  stock: SwaggerInfo;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerInfo)
  auth: SwaggerInfo;
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
  @Type(() => JwtConfig)
  readonly jwt: JwtConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ServiceHost)
  readonly serviceHost: ServiceHost;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerConfig)
  readonly swagger: SwaggerConfig;
}
