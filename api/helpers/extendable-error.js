/**
 * A class that makes it easy to make new error types
 *
 * @example
 * MyCustomErrorType extends ExtendableError {
 *   constructor(message) {
 *    super(message);
 *   }
 * }
 */

export class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

export class NotFoundError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}

export class ValidationError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}
