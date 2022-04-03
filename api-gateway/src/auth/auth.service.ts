import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtConfig } from 'src/config/schema.config';
import { SignupDto } from './dto/auth.dto';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';

@Injectable()
export class AuthService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly configSerivce: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    this.jwtConfig = this.configSerivce.get<JwtConfig>('jwt');
  }

  private issueAccessToken(jwtPayload: {
    id: string | number;
    username: string;
  }) {
    const { access, issuer } = this.jwtConfig;
    return this.jwtService.sign(jwtPayload, { ...access, issuer });
  }

  private issueRefreshToken() {
    const { refresh, issuer } = this.jwtConfig;
    return this.jwtService.sign({}, { ...refresh, issuer });
  }

  private async isRefreshTokenAlive(refreshToken: string): Promise<boolean> {
    const { refresh } = this.jwtConfig;
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: refresh.secret,
        ignoreExpiration: false,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async signup(singupDto: SignupDto) {
    const isExist = !!(await this.userService.getUserByUsername(
      singupDto.username,
    ));
    if (isExist) {
      throw new ConflictException();
    }

    const hashed: string = await bcrypt.hash(
      singupDto.password,
      this.configSerivce.get('salt'),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = await this.userService.createUser({
      ...singupDto,
      password: hashed,
    });

    return result;
  }

  async signin(user: User) {
    const { id, username } = user;
    const accessToken: string = this.issueAccessToken({ id, username });
    const refreshToken: string = this.issueRefreshToken();
    await this.userService.updateTokens(id, accessToken, refreshToken);
    return { id, accessToken };
  }

  async validateUser(username: string, pass: string) {
    const user: User = await User.findOne({ username });
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;
    const isEqual: boolean = await bcrypt.compare(pass, password);
    if (!isEqual) {
      throw new UnauthorizedException();
    }

    return result;
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<{ id: number; username: string } | null> {
    const { issuer, access } = this.jwtConfig;
    try {
      const { id, username } = await this.jwtService.verifyAsync(accessToken, {
        secret: access.secret,
        issuer: issuer, // 발행자 일치 확인
        ignoreExpiration: false, // true면 토큰이 만료되도 에러를 내보내지 않음
      });

      return { id, username };
    } catch (error) {
      return null;
    }
  }

  async refresh(id: string | number, token: string): Promise<string> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new UnauthorizedException('탈퇴한 회원입니다.');
    }

    const { username, accessToken, refreshToken } = user;
    if (accessToken !== token) {
      throw new UnauthorizedException('토큰이 일치하지 않습니다.');
    }

    const isAlive = await this.isRefreshTokenAlive(refreshToken);
    if (!isAlive) {
      throw new UnauthorizedException('리프레쉬 토큰이 만료되었습니다.');
    }

    const newAccessToken = this.issueAccessToken({ id, username });
    await this.userService.updateTokens(id, newAccessToken, refreshToken);

    return newAccessToken;
  }

  async logout(id: number): Promise<void> {
    await this.userService.updateTokens(id, null, null);
  }
}
