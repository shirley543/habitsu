export class GoalTypeChangeNotAllowedError extends Error {
  code = 'GOAL_TYPE_CHANGE_NOT_ALLOWED'
  constructor(message = 'Cannot change goalType once a goal is created') {
    super(message);
  }
}
