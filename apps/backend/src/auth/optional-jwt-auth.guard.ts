import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it never throws an error

  // Error, info, context deliberately un-used but kept in-place to ensure correct assignment of user
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  handleRequest(_err, user, _info, _context) {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
    return user;
  }
}
