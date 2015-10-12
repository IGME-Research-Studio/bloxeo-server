/**
* Service that defines default codes and messages for responses.
*
* {@link https://github.com/IncoCode/sails-service-error-codes#default-error-codes Default error code definitions}
*
* @example
* ErrorCodes.ok.code    // returns 'OK'
* ErrorCodes.ok.message // returns 'Operation is successfully executed'
*
* Codes can be modified/added by passing updates into the `getCodes` call.
*/

module.exports = require('sails-service-error-codes').getCodes();
