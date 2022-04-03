import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
  developmentConfig,
  productionConfig,
} from './config/app-logger.config';
import { CookieConfig, SwaggerConfig } from './config/schema.config';
import { buildSwagger } from './common/swagger/build-swagger';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { AuthModule } from './auth/auth.module';

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
  const { apis, product, stock } = config.get<SwaggerConfig>('swagger');
  buildSwagger('api/', app, apis, [ProductModule, StockModule, AuthModule]);
  buildSwagger('api/auth', app, apis, [AuthModule]);
  buildSwagger('api/products', app, product, [ProductModule]);
  buildSwagger('api/stocks', app, stock, [StockModule]);

  const { secret } = config.get<CookieConfig>('cookie');
  app.use(cookieParser(secret));
  app.use(helmet());
  app.enableCors();
  await app.listen(config.get('port'));
}
bootstrap();
