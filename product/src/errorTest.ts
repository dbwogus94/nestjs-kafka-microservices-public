import { OmitType } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToClass,
  plainToInstance,
  Type,
} from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ManyToOne, OneToMany } from 'typeorm';

export class Product {
  @Expose()
  @IsOptional()
  id?: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsArray()
  // @Type(() => ProductPrice) // **없으면 배열에 필드를 부여한 형태로 할당됨, 또한 인스턴스로 가지게 하려면 필수 항목이다.
  @ArrayMinSize(1)
  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product, {
    cascade: true,
  })
  prices: ProductPrice[];
}

export class ProductPrice {
  @IsOptional()
  id?: number;

  @Exclude()
  @ManyToOne(() => Product, (product) => product.prices)
  product: Product;

  @Expose()
  @IsNumber()
  period: number;

  @Expose()
  @IsNumber()
  price: number;
}

export class CreateProductDTO extends OmitType(Product, ['id']) {}

const data = {
  name: '1번 상품',
  description: '매트리스 미포함',
  use: true,
  prices: [
    {
      period: 1,
      price: 10000,
    },
    {
      period: 2,
      price: 20000,
    },
  ],
};

/**
 *  오류 재연 하기위한 세팅
 *  - plainToInstance 와 plainToClass 둘다 같은 증상 있음
 */

const res = plainToInstance(CreateProductDTO, data, {
  // true로 설정하면 class-transformer는 TS 반영 유형을 기반으로 변환을 시도합니다.
  enableImplicitConversion: true, // TODO: 문제 발생 옵션 객체를 배열로 매핑하게 만드는 옵션
  // true로 설정하면 값이 undefined인 필드가 클래스에서 플레인 변환으로 포함됩니다.
  exposeUnsetFields: false,
});

// const res = plainToClass(CreateProductDTO, data, {
//   // true로 설정하면 class-transformer는 TS 반영 유형을 기반으로 변환을 시도합니다.
//   enableImplicitConversion: true, // TODO: 문제 발생 옵션 객체를 배열로 매핑하게 만드는 옵션
//   // true로 설정하면 값이 undefined인 필드가 클래스에서 플레인 변환으로 포함됩니다.
//   exposeUnsetFields: false,
// });

// 위의 세팅으로 결과를 확인하면
// >> prices: [ [ period: 1, price: 10000 ], [ period: 2, price: 20000 ] ] 이런 객체가 잡힌다.
console.dir(res);

/* 출력 결과 
CreateProductDTO {
  name: '1번 상품',
  description: '매트리스 미포함',
  use: true,
  prices: [ [ period: 1, price: 10000 ], [ period: 2, price: 20000 ] ]
}
*/

// 위의 결과의 prices는 JSON에 없는 데이터 형태이기 때문에 직열화시 데이터 유실된다.
// **에러도 발생하지 않는다.
console.dir(JSON.stringify(res));

/* 출력 결과
  '{"name":"1번 상품","description":"매트리스 미포함","use":true,"prices":[[],[]]}'
 */
