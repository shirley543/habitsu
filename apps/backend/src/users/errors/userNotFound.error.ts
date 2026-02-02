export class UserNotFoundError extends Error {
  constructor(identifier: number | string) {
    super(`User ${identifier} not found`);
  }
}
