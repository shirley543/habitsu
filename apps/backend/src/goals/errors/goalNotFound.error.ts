import { GoalDomainError } from './goal.domainError';

export class GoalNotFoundError extends GoalDomainError {
  code = 'GOAL_NOT_FOUND';
  constructor(
    message: string = "Goal not found",
  ) {
    super(message);
  }
}
