import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import {
  developmentConfig,
  productionConfig,
} from './config/app-logger.config';
import { SwaggerConfig } from './config/schema.config';
import { ConfigService } from '@nestjs/config';
import { buildSwagger } from './common/swagger/build-swagger';
import helmet from 'helmet';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';

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
  buildSwagger('api/', app, apis, [ProductModule, StockModule]);
  buildSwagger('api/products', app, product, [ProductModule]);
  buildSwagger('api/stocks', app, stock, [StockModule]);

  app.use(helmet());
  app.enableCors();
  await app.listen(config.get('port'));
}
bootstrap();
