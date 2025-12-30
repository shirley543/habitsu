import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it never throws an error
  handleRequest(_err, user, _info, _context) {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
    return user;
  }
}
