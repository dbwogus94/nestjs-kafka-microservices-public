import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    // 서비스에서 사용할 kafka 클라이언트 모듈 동기 생성
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        useFactory: async (configService: ConfigService) => {
          const { brokers } = configService.get('kafka');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'product',
                brokers: brokers,
              },
              consumer: {
                groupId: 'product-consumer', // billing-consumer-client으로 생성 또는 등록
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
