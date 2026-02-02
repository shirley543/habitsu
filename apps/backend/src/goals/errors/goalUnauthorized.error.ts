import { GoalDomainError } from "./goal.domainError";

export class GoalUnauthorizedError extends GoalDomainError {
  code = 'GOAL_UNAUTHORIZED'
  constructor(goalId?: number, action: string = 'accessed') {
    super(goalId
      ? `Goal ${goalId} cannot be ${action} by the current user`
      : `Goal cannot be ${action} by the current user`);
  }
}
