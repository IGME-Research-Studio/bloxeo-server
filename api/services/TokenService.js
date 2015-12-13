/**
 * Token Service
 *
 * @file Contains logic for Token related actions
 * @module TokenService api/services/TokenService
 */
import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import CFG from '../../config';

const tokenService = {};

/**
 * Wraps jwt#sign in a promise for our async APIs and binds our secret
 * @param {Object} - user object
 * @returns {Promise<String|Error>} - that immediately resolves to a token
 */
tokenService.encode = function(authData) {
  try {
    return Promise.resolve(jwt.sign(authData, CFG.jwt.secret));
  }
  catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Wraps jwt#verify in a promise for our async APIs and binds our secret
 * @param {Object} - user object
 * @returns {Promise<Object|JsonWebTokenError|Error}
 * - that immediately resolves to a user object or rejects
 */
tokenService.verify = function(token) {
  try {
    return Promise.resolve(jwt.verify(token, CFG.jwt.secret));
  }
  catch (e) {
    return Promise.reject(e);
  }
};

tokenService.verifyAndGetId = function(token) {
  return tokenService.verify(token).get('_id');
};

module.exports = tokenService;
