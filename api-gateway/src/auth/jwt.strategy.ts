import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { CookieConfig } from 'src/config/schema.config';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';

/* TODO: 리프레쉬 토큰 작업으로 passport-jwt 전략 사용하지 않음 
  - jwt 만료인 경우 리프레쉬 플로우: 
  1. 시크릿 쿠키 확인
  2. jwt 디코드
  3. 
*/
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    // 시크릿 쿠키 추출기 정의
    const fromSignedCookieAsToken = function (): JwtFromRequestFunction {
      return function (req: Request) {
        const cookieConfig = configService.get<CookieConfig>('cookie');
        const { key } = cookieConfig.jwtCookieConfig;

        if (!req || Object.keys(req.signedCookies).length === 0) return null;

        const [accessToken, id]: string[] = req.signedCookies[key].split(' ');
        if (!accessToken || !id) return null;

        return accessToken;
      };
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromSignedCookieAsToken()]),
      ignoreExpiration: false, // true면 토큰 만료를 확인하지 않음, false면 만료된 토큰 401 Unauthorized 리턴
      issuer: configService.get<string>('JWT_ISSUER'), // 발행자 일치하는지 확인
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.userService.getUserById(
      payload.id,
    );

    return user;
  }
}
