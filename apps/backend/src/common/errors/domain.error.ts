/**
 * Base class for domain-specific errors.
 * Extend this to create domain error types; each must define a unique `code`.
 * Caught by exception filters and mapped to HTTP responses.
 */
export abstract class DomainError extends Error {
  abstract code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
