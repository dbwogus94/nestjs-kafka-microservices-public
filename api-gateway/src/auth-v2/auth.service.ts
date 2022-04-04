import { ConflictException, Injectable } from '@nestjs/common';
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

  private issueRefreshToken(jwtPayload: {
    id: string | number;
    username: string;
  }) {
    const { refresh, issuer } = this.jwtConfig;
    return this.jwtService.sign(jwtPayload, { ...refresh, issuer });
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
    const refreshToken: string = this.issueRefreshToken({ id, username });

    // **refresh 토큰만 암호화 한다
    const hashedRefreshToken: string = await bcrypt.hash(
      refreshToken,
      this.configSerivce.get('salt'),
    );

    await this.userService.updateTokens(id, accessToken, hashedRefreshToken);
    return { id, accessToken, refreshToken };
  }

  async refresh(user: User): Promise<string> {
    const { id, username, refreshToken } = user;
    const newAccessToken = this.issueAccessToken({ id, username });
    await this.userService.updateTokens(id, newAccessToken, refreshToken);
    return newAccessToken;
  }

  async logout(id: number): Promise<void> {
    await this.userService.updateTokens(id, null, null);
  }

  /* 아래는 strategy에서 사용되는 메서드 */

  async validateUser(username: string, pass: string) {
    const user: User = await User.findOne({ username });
    if (!user) {
      return null;
    }
    const { password, ...result } = user;
    const isEqual: boolean = await bcrypt.compare(pass, password);
    if (!isEqual) {
      return null;
    }
    return result;
  }

  async getUserIfAccessTokenMatches(id: string | number, token: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    if (token !== result.accessToken) {
      return null;
    }
    return result;
  }

  async getUserIfRefreshTokenMatches(id: string | number, token: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    const isEqual: boolean = await bcrypt.compare(token, result.refreshToken);
    if (!isEqual) {
      return null;
    }
    return result;
  }
}
