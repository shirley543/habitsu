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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
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
    const payload = { email: user.email, sub: user.username };
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
