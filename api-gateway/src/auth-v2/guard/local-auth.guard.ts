import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SigninDto } from 'src/auth-v2/dto/auth.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const signinDto: SigninDto = plainToInstance(SigninDto, request.body, {
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    });

    const errors = await validate(signinDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        const constraints = error.constraints;
        return Object.keys(constraints) //
          .map((key) => constraints[key])
          .reduce((perv, cur) => perv.concat(cur));
      });

      // AuthGuard의 handleRequest를 사용하여 에러를 헨들링 한다.
      super.handleRequest(new BadRequestException(messages), null, null, null);
    }

    // 위의 커스텀 인증 로직이 모두 통과하면 AuthGuard의 canActivate를 호출한다.
    return super.canActivate(context);
  }
}
