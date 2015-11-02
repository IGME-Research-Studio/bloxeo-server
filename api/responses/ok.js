/**
* 200 (OK) Response
*
* @description
* General status code. Most common code used to indicate success.
* The actual response will depend on the request method used.
* In a GET request, the response will contain an entity corresponding to the
* requested resource.
* In a POST request the response will contain an entity describing or
* containing the result of the action.
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
* return res.ok();
* return res.ok(data);
* return res.ok(data, {message: 'We're all good.'});
*/

const ErrorCodes = require('sails-service-error-codes').getCodes();
const _ = require('lodash');

module.exports = function ok(data, options) {

  const defaults = {
    code: ErrorCodes.ok.code,
    message: ErrorCodes.ok.message,
    data: data || {},
  };

  const response = _.defaults(options || {}, defaults);

  this.res.status(200);
  this.res.jsonx(response);
};

