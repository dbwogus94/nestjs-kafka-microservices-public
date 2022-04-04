import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemaConfig } from './config/schema.config';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { CustomHttpModule } from './custom-http/custom-http.module';
import { AuthModule } from './auth/auth.module';
import { AuthV2Module } from './auth-v2/auth.module';

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
    CustomHttpModule.register(),
    MorganModule,
    ProductModule,
    StockModule,
    AuthModule,
    AuthV2Module,
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
