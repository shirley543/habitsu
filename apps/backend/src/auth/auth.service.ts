import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '@habit-tracker/validation-schemas';
import { JwtPayload } from './jwt-auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.usersService.findOneByEmailFull(email);
    const passwordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;
    if (user && passwordValid) {
      // Password deliberately destructured and un-used, to remove it from the returned result
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Generate JWT from a subset of `user` object properties
   *
   * @param user - user to generate JWT with
   * @returns - obj with `access_token`
   */
  login(user: UserResponseDto) {
    const payload: JwtPayload = {
      email: user.email,
      username: user.username,
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
