import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import {
  developmentConfig,
  productionConfig,
} from './config/app-logger.config';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfig } from './config/schema.config';
import { buildSwagger } from './common/swagger/build-swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      process.env.NODE_ENV === 'production'
        ? productionConfig
        : developmentConfig,
    ),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeUnsetFields: false,
      }, // 이부분은 app에 요청이 왔다갔다 하는 부분에만 적용
    }),
  );

  const config = app.get(ConfigService);
  const swaggerConfig = config.get<SwaggerConfig>('swagger');
  buildSwagger('api/products', app, swaggerConfig);

  app.use(helmet());
  app.enableCors();
  await app.listen(config.get('port'));
}
bootstrap();
