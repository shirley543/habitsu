import { GoalDomainError } from './goal.domainError';

export class GoalUnauthorizedError extends GoalDomainError {
  code = 'GOAL_UNAUTHORIZED';
  constructor(action: string = 'accessed') {
    super(`Goal cannot be ${action} by the current user`);
  }
}
