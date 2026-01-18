export class GoalReorderInputInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoalReorderInputInvalidError';
  }
}