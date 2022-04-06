import { DynamicModule, Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CustomHttpService } from './custom-http.service';

@Module({})
export class CustomHttpModule {
  static register(): DynamicModule {
    return {
      module: CustomHttpModule,
      imports: [HttpModule],
      providers: [CustomHttpService, Logger],
      exports: [CustomHttpService],
      global: true,
    };
  }
}
