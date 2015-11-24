/**
* Constants Service
*
* @file Method to return our routes to Klient
* @module services/ConstantService.js
*/

const EXT_EVENT_API = require('../constants/EXT_EVENT_API');
const REST_API = require('../constants/REST_API');

module.exports = function() {
  return {
    'EVENT_API': EXT_EVENT_API,
    'REST_API': REST_API,
  };
};
