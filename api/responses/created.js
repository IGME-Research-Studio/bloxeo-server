/**
* 403 (Created) Handler
*
* @description
* The request has been fulfilled and resulted in a new resource being created.
* Successful creation occurred (via either POST or PUT).
* Set the Location header to contain a link to the newly-created resource
* (on POST).
* Response body content may or may not be present.
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
* return res.created();
* return res.created(data);
* return res.created(data, {message: 'I made it'});
*/

const ErrorCodes = require('sails-service-error-codes').getCodes();
const _ = require('lodash');

module.exports = function created(data, options) {

  const defaults = {
    code: ErrorCodes.created.code,
    message: ErrorCodes.created.message,
    data: ((sails.config.environment === 'production') ? undefined : data || {}),
  };

  const response = _.defaults(options || {}, defaults);

  this.res.status(201);
  this.res.jsonx(response);
};

