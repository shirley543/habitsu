import { GoalDomainError } from './goal.domainError';

export class GoalTypeChangeNotAllowedError extends GoalDomainError {
  code = 'GOAL_TYPE_CHANGE_NOT_ALLOWED';
  constructor(message = 'Cannot change goalType once a goal is created') {
    super(message);
  }
}
