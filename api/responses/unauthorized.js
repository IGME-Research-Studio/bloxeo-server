/**
* 401 (Unauthorized) Handler
*
* @description
* Similar to 403 Forbidden.
* Specifically for use when authentication is possible but has failed or not
* yet been provided.
* Error code response for missing or invalid authentication token.
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
* return res.unauthorized();
* return res.unauthorized(data);
* return res.unauthorized(data, {message: 'I'm sorry Dave, I'm afraid I can't do that'});
*/

const ErrorCodes = require('sails-service-error-codes').getCodes();
const _ = require('lodash');

module.exports = function unauthorized(data, options) {

  const defaults = {
    code: ErrorCodes.unauthorized.code,
    message: ErrorCodes.unauthorized.message,
    data: ((sails.config.environment === 'production') ? undefined : data || {}),
  };

  const response = _.defaults(options || {}, defaults);

  this.res.status(401);
  this.res.jsonx(response);
};

