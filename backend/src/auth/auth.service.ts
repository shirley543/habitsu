import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {
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
}
