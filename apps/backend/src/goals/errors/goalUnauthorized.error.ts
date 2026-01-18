export class GoalUnauthorizedError extends Error {
  constructor(goalId?: number, action: string = 'accessed') {
    super(goalId
      ? `Goal ${goalId} cannot be ${action} by the current user`
      : `Goal cannot be ${action} by the current user`);
    this.name = 'GoalUnauthorizedError';
  }
}
