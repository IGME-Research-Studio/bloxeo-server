/**
* Constants Service
*
* @file Method to return our routes to Klient
* @module services/ConstantService.js
*/

const EVENT_API = require('../constants/EVENT_API.js');
const REST_API = require('../constants/REST_API.js');

module.exports = function() {
  return {
    'EVENT_API': EVENT_API,
    'REST_API': REST_API,
  };
};
