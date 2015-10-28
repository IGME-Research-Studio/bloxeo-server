/**
* 404 (Not Found) Handler
*
* @description
* The requested resource could not be found but may be available again in the
* future. Subsequent requests by the client are permissible.
* Used when the requested resource is not found, whether it doesn't exist.
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
* return res.notFound();
* return res.notFound(data);
* return res.notFound(data, {message: 'That's not here'});
*
* NOTE:
* If a request doesn't match any explicit routes (i.e. `config/routes.js`)
* or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
* automatically.
*/

const ErrorCodes = require('sails-service-error-codes').getCodes();
const _ = require('lodash');

module.exports = function notFound(data, options) {

  const defaults = {
    code: ErrorCodes.notFound.code,
    message: ErrorCodes.notFound.message,
    data: ((sails.config.environment === 'production') ? undefined : data || {}),
  };

  const response = _.defaults(options || {}, defaults);

  this.res.status(404);
  this.res.jsonx(response);
};

