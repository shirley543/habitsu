import { DomainError } from '../../common/errors/domain.error';

/**
 * Base class for user-specific domain errors.
 * Extend this to create user error types (e.g. UserNotFoundError, UserUnauthorizedError).
 */
export abstract class UserDomainError extends DomainError {}
