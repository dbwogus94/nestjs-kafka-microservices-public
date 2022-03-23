import { Logger } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DeepPartial, ObjectLiteral } from 'typeorm';

export class BaseConfig {
  /**
   * plainToClass를 사용하여 유효성를 검사 수행
   * @param this plainToClass로 생성할 대상 클래스
   * @param record plainToClass에 사용될 데이터 object
   * @returns
   */
  public static from<T extends ObjectLiteral>(
    this: new () => T,
    record: DeepPartial<T>,
  ): Record<string, any> {
    const klass = plainToClass(this, record);
    const errors = validateSync(klass);

    if (errors.length > 0) {
      Logger.error(
        errors.map((v) => v.toString()).toString(),
        [],
        'BaseConfig',
      );
      throw new Error('Configuration Validation Error Occured');
    }

    if (klass.hasOwnProperty('logConfig') && klass.logConfig) {
      Logger.debug(klass);
    }

    return classToPlain(klass);
  }

  /**
   * 특정 환경변수 정보를 가진 객체를 리턴한다.
   * - default: local.config.ts
   * @param param0
   * @returns
   */
  public static async get({
    title,
    key,
  }: {
    title?: string;
    key?: string;
  } = {}): Promise<Record<string, any>> {
    const config = (
      await import(
        `./${title ? title || 'local' : process.env.NODE_ENV || 'local'}.config`
      )
    ).default;

    if (Object.keys(config).length === 0) {
      throw new Error(
        'local.config file not found OR process.env.NODE_ENV not found',
      );
    }

    return key ? config[key] : config;
  }
}
