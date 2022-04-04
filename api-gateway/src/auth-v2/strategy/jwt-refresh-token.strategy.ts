import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from 'src/auth-v2/auth.service';
import { CookieConfig } from 'src/config/schema.config';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // 시크릿 쿠키 추출기 정의
    const fromSignedCookieAsToken = function (): JwtFromRequestFunction {
      return function (req: Request) {
        const cookieConfig = configService.get<CookieConfig>('cookie');
        const { key } = cookieConfig.refreshCookie;
        if (!req || !req.signedCookies[key]) return null;
        return req.signedCookies[key];
      };
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromSignedCookieAsToken()]),
      ignoreExpiration: false, // true면 토큰 만료를 확인하지 않음, false면 만료된 토큰 401 Unauthorized 리턴
      issuer: configService.get<string>('JWT_ISSUER'), // 발행자 일치하는지 확인
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const { refreshCookie } = this.configService.get<CookieConfig>('cookie');
    const refreshToken = req.signedCookies[refreshCookie.key];
    const { id } = payload;
    return this.authService.getUserIfRefreshTokenMatches(id, refreshToken);
  }
}
