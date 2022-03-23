import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemaConfig } from './config/schema.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? './env/production.env'
          : './env/development.env',
      isGlobal: true,
      load: [() => SchemaConfig.get()],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),

    // 서비스에서 사용할 kafka 클라이언트 모듈 동기 생성
    ClientsModule.registerAsync([
      {
        name: 'STOCK_SERVICE',
        useFactory: async (configService: ConfigService) => {
          const { brokers } = configService.get('kafka');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'stock',
                brokers: brokers,
              },
              consumer: {
                groupId: 'stock-consumer', // stock-consumer-client으로 생성 또는 등록
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
