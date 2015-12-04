/**
 * Token Service
 *
 * @file Contains logic for Token related actions
 * @module TokenService api/services/TokenService
 */
const JWT = require('jsonwebtoken');
const config = require('../../config').default.jwt;
const tokenService = {};

tokenService.generateNewToken = function(authData) {

  return JWT.sign(
    authData,
    config.secret,
    {'expiresIn': config.timeout});
};

tokenService.authenticateToken = function(token) {

  return JWT.verify(token, config.secret);
};

module.exports = tokenService;
