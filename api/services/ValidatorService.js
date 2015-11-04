/**
* Extend node's validator package and expose it to the application as a service.
*/

const valid = require('validator');

valid.extend('isntNull', (str) => !valid.isNull(str));

module.exports = valid;
