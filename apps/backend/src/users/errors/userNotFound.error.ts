import { UserDomainError } from './user.domainError';

export class UserNotFoundError extends UserDomainError {
  code = 'USER_NOT_FOUND';
  constructor(identifier: number | string) {
    super(`User ${identifier} not found`);
  }
}
