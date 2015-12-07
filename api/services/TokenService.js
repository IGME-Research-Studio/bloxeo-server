/**
 * Token Service
 *
 * @file Contains logic for Token related actions
 * @module TokenService api/services/TokenService
 */
import jwt from 'jsonwebtoken';
import CFG from '../../config';
const tokenService = {};

tokenService.encode = function(authData) {
  return jwt.sign(authData, CFG.jwt.secret, {'expiresIn': CFG.jwt.timeout});
};

tokenService.decode = function(token) {
  return jwt.verify(token, CFG.jwt.secret);
};

module.exports = tokenService;
