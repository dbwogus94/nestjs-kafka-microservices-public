import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { CookieConfig } from 'src/config/schema.config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // 시크릿 쿠키 추출기 정의
    const fromSignedCookieAsToken = function (): JwtFromRequestFunction {
      return function (req: Request) {
        const cookieConfig = configService.get<CookieConfig>('cookie');
        const { key } = cookieConfig.accessCookie;
        // TODO: 브라우저에서 만료된 쿠키를 제거하는 시점에 따라 조건문을 바꿔야함
        if (!req || !req.signedCookies[key]) return null;
        return req.signedCookies[key];
      };
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromSignedCookieAsToken()]),
      ignoreExpiration: false, // true면 토큰 만료를 확인하지 않음, false면 만료된 토큰 401 Unauthorized 리턴
      issuer: configService.get<string>('JWT_ISSUER'), // 발행자 일치하는지 확인
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      passReqToCallback: true, // validate 메서드에 Request 객체를 넘기는 옵션
    });
  }

  async validate(req: Request, payload: any) {
    const { accessCookie } = this.configService.get<CookieConfig>('cookie');
    const accessToken = req.signedCookies[accessCookie.key];
    const { id } = payload;
    return this.authService.getUserIfAccessTokenMatches(id, accessToken);
  }
}
