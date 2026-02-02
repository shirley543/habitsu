export class GoalReorderInputInvalidError extends Error {
  code = 'GOAL_REORDER_INPUT_INVALID'
  constructor(message: string) {
    super(message);
  }
}