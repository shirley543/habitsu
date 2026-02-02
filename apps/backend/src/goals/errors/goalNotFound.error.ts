import { GoalDomainError } from './goal.domainError';

export class GoalNotFoundError extends GoalDomainError {
  code = 'GOAL_NOT_FOUND';
  constructor(
    goalId: number | undefined,
    message: string | undefined = undefined,
  ) {
    super(message || `Goal with id ${goalId} not found`);
  }
}
