import { GoalDomainError } from "./goal.domainError";

export class GoalReorderInputInvalidError extends GoalDomainError {
  code = 'GOAL_REORDER_INPUT_INVALID'
  constructor(message: string) {
    super(message);
  }
}