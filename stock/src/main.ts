import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import {
  developmentConfig,
  productionConfig,
} from './config/app-logger.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger: WinstonModule.createLogger(
        process.env.NODE_ENV === 'production'
          ? productionConfig
          : developmentConfig,
      ),
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER_1],
        },
        consumer: {
          groupId: 'stock-consumer',
        },
      },
    },
  );
  app.listen();
}
bootstrap();
