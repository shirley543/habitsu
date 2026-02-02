import { UserDomainError } from './user.domainError';

export class UserPasswordInputInvalidError extends UserDomainError {
  code = 'USER_PASSWORD_INPUT_INVALID';
  constructor(message: string) {
    super(message);
  }
}
