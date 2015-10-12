/**
* 403 (Forbidden) Handler
*
* @description
* The request was a legal request, but the server is refusing to respond to it.
* Unlike a 401 Unauthorized response, authenticating will make no difference.
* Error code for user not authorized to perform the operation or the resource
* is unavailable for some reason.
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
* return res.forbidden();
* return res.forbidden(data);
* return res.forbidden(data, {message: 'I'm sorry Dave, I'm afraid I can't do that'});
*/

const ErrorCodes = require('../services/ErrorCodeService');
const _ = require('lodash');

module.exports = function forbidden(data, options) {

  const defaults = {
    code: ErrorCodes.forbidden.code,
    message: ErrorCodes.forbidden.message,
    data: data || {},
  };

  const response = _.defaults(options || {}, defaults);

  this.res.status(403);
  this.res.jsonx(response);
};

