import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UserService } from './user/user.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, UserService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
