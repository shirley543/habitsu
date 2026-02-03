import { GoalEntryDomainError } from "./goalEntry.domainError";

export class GoalEntryNotFoundError extends GoalEntryDomainError {
  code = 'GOAL_ENTRY_NOT_FOUND';
  constructor(goalEntryId: number) {
    super(`Goal entry with id ${goalEntryId} not found`);
  }
}
