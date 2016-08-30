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

import ExtendableError from 'es6-error';

class CustomDataError extends ExtendableError {

  constructor(message = '', data = {}) {
    super(message);
    this.data = data;
  }
}

export class EmptyBoardError extends CustomDataError { }

export class NotFoundError extends CustomDataError { }

export class ValidationError extends CustomDataError { }

export class NoOpError extends CustomDataError { }

export class UnauthorizedError extends CustomDataError { }

export class InvalidDuplicateError extends CustomDataError { }
