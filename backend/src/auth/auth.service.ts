import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    const passwordValid = user ? await bcrypt.compare(password, user.password) : false;
    if (user && passwordValid) {
      const { password, ...result } = user;
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
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
