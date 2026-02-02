import { DomainError } from '../../common/errors/domain.error';

/**
 * Base class for goal-specific domain errors.
 * Extend this to create goal error types (e.g. GoalNotFoundError, GoalUnauthorizedError).
 */
export abstract class GoalDomainError extends DomainError {}
