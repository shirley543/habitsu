import { UserDomainError } from './user.domainError';

export class UserAlreadyExistsError extends UserDomainError {
  code = 'USER_ALREADY_EXISTS';
  constructor(message: string) {
    super(message);
  }
}
