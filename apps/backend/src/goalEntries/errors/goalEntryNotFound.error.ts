export class GoalEntryNotFoundError extends Error {
  constructor(goalEntryId: number) {
    super(`Goal entry with id ${goalEntryId} not found`);
  }
}
