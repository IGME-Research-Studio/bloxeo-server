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

export class NotFoundError extends ExtendableError { }

export class ValidationError extends ExtendableError { }

export class NoOpError extends ExtendableError { }

export class UnauthorizedError extends ExtendableError { }
