/**
* 400 (Bad Request) Handler
*
* @description
* The request cannot be fulfilled due to bad syntax.
* General error when fulfilling the request would cause an invalid state.
* Domain validation errors, missing data, etc.
*
* @param {Object} [data] arbitrary data object
* @param {Object} [options]
* @param {String} [options.code]
* @param {String} [options.message]
*
* @see {@link ErrorCodeService}
* {@link https://github.com/IncoCode/sails-service-error-codes#default-error-codes Default error code definitions}
*
* @example
* return res.badRequest();
* return res.badRequest(data);
* return res.badRequest(data, {message: 'Bad syntax, yo!'});
*/

const ErrorCodes = require('sails-service-error-codes').getCodes();
const _ = require('lodash');

module.exports = function badRequest(data, options) {

  const defaults = {
    code: ErrorCodes.badRequest.code,
    message: ErrorCodes.badRequest.message,
    data: ((sails.config.environment === 'production') ? undefined : data || {}),
  };

  const response = _.defaults(options || {}, defaults);

  this.res.status(400);
  this.res.jsonx(response);
};

