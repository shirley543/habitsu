import { GoalDomainError } from "./goal.domainError";

export class GoalNotFoundError extends GoalDomainError {
  code = 'GOAL_NOT_FOUND'
  constructor(goalId: number) {
    super(`Goal with id ${goalId} not found`);
  }
}
