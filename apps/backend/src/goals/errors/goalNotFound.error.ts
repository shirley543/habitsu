export class GoalNotFoundError extends Error {
  constructor(goalId: number) {
    super(`Goal with id ${goalId} not found`);
  }
}
