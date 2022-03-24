import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemaConfig } from './config/schema.config';
import { KafkaModule } from './kafka/kafka.module';
import { StockConsumer } from './stock.consumer';

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
    HttpModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, StockConsumer],
})
export class AppModule {}
