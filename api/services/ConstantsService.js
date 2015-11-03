/**
 * Constants Service
 *
 * @file Method to return our routes to Klient
 * @module services/ConstantService.js
 */

 const SOCKET_API = require('../constants/SOCKET_API.js');
 const HTTP_API = require('../constants/HTTP_API.js');

 module.exports = function() {
  return SOCKET_API;
 };
