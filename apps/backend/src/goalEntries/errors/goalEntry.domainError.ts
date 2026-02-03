import { DomainError } from '../../common/errors/domain.error';

/**
 * Base class for goal entry-specific domain errors.
 * Extend this to create goal error types (e.g. GoalEntryNotFoundError).
 */
export abstract class GoalEntryDomainError extends DomainError {}
