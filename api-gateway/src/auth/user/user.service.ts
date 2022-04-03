import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { SignupDto } from '../dto/auth.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private connection: Connection) {}

  async getUserById(userId: number | string) {
    return User.findOne(userId);
  }

  async getUserByUsername(username: string) {
    return User.findOne({ username });
  }

  async createUser(singupDto: SignupDto) {
    const user = User.create(singupDto);
    await User.save(user);
    return user;
  }

  async updateTokens(userId: number | string, access: string, refresh: string) {
    const findUser = await User.findOne(userId);

    const newUser = User.create({
      ...findUser,
      accessToken: access,
      refreshToken: refresh,
    });

    return User.save(newUser);
  }
}
