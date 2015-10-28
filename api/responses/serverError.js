/**
* 500 (Internal Server Error) Response
*
* @description
* A generic error message, given when no more specific message is suitable.
* The general catch-all error when the server-side throws an exception.
*
* @param {Object} [data] arbitrary data object
* @param {Object} [options]
* @param {String} [options.code]
* @param {String} [options.message]
* @param {Object} [options.root]
*
* @see {@link ErrorCodeService}
* {@link https://github.com/IncoCode/sails-service-error-codes#default-error-codes Default error code definitions}
*
* @example
* return res.serverError();
* return res.serverError(data);
* return res.serverError(data, {message: 'Uh-oh'});
*
* NOTE:
* If something throws in a policy or controller, or an internal
* error is encountered, Sails will call `res.serverError()`
* automatically.
*/

const ErrorCodes = require('sails-service-error-codes').getCodes();
const _ = require('lodash');

module.exports = function serverError(data, options) {

  const defaults = {
    code: ErrorCodes.serverError.code,
    message: ErrorCodes.serverError.message,
    data: ((sails.config.environment === 'production') ? undefined : data || {}),
  };

  // Log error to console
  sails.log.error(500, data);

  const response = _.defaults(options || {}, defaults);

  this.res.status(500);
  this.res.jsonx(response);
};

