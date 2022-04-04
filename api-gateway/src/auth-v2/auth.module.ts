import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { JwtAccessTokenStrategy } from './strategy/jwt-access-token.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { UserService } from './user/user.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthV2Module {}
