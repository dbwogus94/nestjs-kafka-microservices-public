import { OmitType, PickType } from '@nestjs/swagger';
import { User } from '../user/user.entity';

export class SignupDto extends OmitType(User, [
  'id',
  'use',
  'accessToken',
  'refreshToken',
]) {}

export class SigninDto extends PickType(User, ['username', 'password']) {}
