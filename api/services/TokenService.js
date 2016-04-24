/**
 * Token Service
 *
 * @file Contains logic for Token related actions
 * @module TokenService api/services/TokenService
 */
import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import CFG from '../../config';

/**
 * Wraps jwt#sign in a promise for our async APIs and binds our secret
 * @param {Object} - user object
 * @returns {Promise<String|Error>} - that immediately resolves to a token
 */
export const encode = function(authData) {
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
export const verify = function(token) {
  try {
    return Promise.resolve(jwt.verify(token, CFG.jwt.secret));
  }
  catch (e) {
    return Promise.reject(e);
  }
};

export const verifyAndGetId = function(token) {
  return verify(token).get('_id');
};
