import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerInfo } from 'src/config/schema.config';

export function buildSwagger(
  path: string,
  app: INestApplication,
  config: SwaggerInfo,
  // eslint-disable-next-line @typescript-eslint/ban-types
  modules: Function[] = void 0,
): void {
  const { title, description, version } = config;
  const swaggerConfig = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    include: modules,
  });

  SwaggerModule.setup(path, app, document);
}
