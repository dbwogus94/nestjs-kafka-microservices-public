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
import { CookieOptions } from 'express';
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
  expiresIn: string;
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

export class CookieOption implements CookieOptions {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  maxAge: number; // 만료일, 단위 ms(밀리세컨드)

  @IsBoolean()
  signed?: boolean; // 암호화 옵션

  @IsBoolean()
  httpOnly?: boolean;

  @IsString()
  domain?: string; // 적용할 도메인

  @IsString()
  path?: string; // 적용할 도메인 path

  @IsBoolean()
  secure?: boolean; // https에서만 사용 옵션

  @IsNotEmpty()
  sameSite: boolean | 'lax' | 'strict' | 'none' = 'lax';
  /* "strict" : 서로 다른 도메인에서 아예 전송 불가능. 보안성은 높으나 편의가 낮다.
   * "lax" : 서로 다른 도메인이지만 일부 예외( HTTP get method / a href / link href )에서는 전송 가능.
   * "none" : 모든 도메인에서 전송 가능 + https 환경 필수
   */
}

export class CookieInfo {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CookieOption)
  options: CookieOption;
}

export class CookieConfig {
  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CookieInfo)
  jwtCookieConfig: CookieInfo;
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
  @IsNotEmpty()
  @IsNumber()
  readonly port: number = 80;

  @IsNotEmpty()
  @IsNumber()
  readonly salt: number;

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
  @Type(() => CookieConfig)
  readonly cookie: CookieConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ServiceHost)
  readonly serviceHost: ServiceHost;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SwaggerConfig)
  readonly swagger: SwaggerConfig;
}
