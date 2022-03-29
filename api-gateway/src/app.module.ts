import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemaConfig } from './config/schema.config';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';

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
    MorganModule,
    ProductModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR, // MorganInterceptor는 라이프 사이클에서 가장 마지막에 실행. TODO: 윈스턴으로 적용방법 찾아야함
      useClass: MorganInterceptor(
        process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
      ),
    },
  ],
})
export class AppModule {}
