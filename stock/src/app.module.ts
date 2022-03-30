import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemaConfig } from './config/schema.config';
import { KafkaModule } from './kafka/kafka.module';
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

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
    KafkaModule.register(),
    MorganModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor(
        process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
      ),
    },
  ],
})
export class AppModule {}
