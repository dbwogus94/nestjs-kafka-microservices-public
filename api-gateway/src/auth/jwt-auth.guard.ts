import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CookieConfig } from 'src/config/schema.config';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';

/* TODO: 리프레쉬 토큰 작업으로 passport-jwt 전략 사용하지 않음 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  private getSignedCookie(
    req: Request,
    key: string,
  ): { accessToken: string; id: string } | null {
    if (!req.signedCookies || !req.signedCookies[key]) return null;
    const [accessToken, id]: string[] = req.signedCookies[key].split(' ');
    if (!accessToken || !id) return null;
    return { accessToken, id };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const { accessCookie } = this.configService.get<CookieConfig>('cookie');
    const { key, options } = accessCookie;

    let userId: string | number;
    try {
      const cookie = this.getSignedCookie(req, key);
      if (!cookie) {
        throw new UnauthorizedException('쿠키가 존재하지 않습니다.');
      }

      const { accessToken, id } = cookie;
      const payload = await this.authService.verifyAccessToken(accessToken);

      // 만료 또는 유효하지 않는 토큰인 경우 => 리프레시 로직 호출
      if (!payload) {
        const newAccessToken = await this.authService.refresh(id, accessToken);
        res.cookie(key, `${newAccessToken} ${id}`, options);
      }

      userId = payload ? payload.id : id;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.userService.getUserById(userId);
      req.user = user;

      return this.handleRequest(void 0, user);
    } catch (error) {
      return this.handleRequest(error, void 0);
    }
  }

  handleRequest(err: Error, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return true;
  }
}
