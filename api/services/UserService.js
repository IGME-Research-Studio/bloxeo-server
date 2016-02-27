/**
* UserService: contains actions related to users and boards.
*
* @file Contains logic for User related actions
* @module UserService api/services/UserService
*/

import tokenService from './TokenService';
import { model as User } from '../models/User.js';
const self = {};

/**
 * Create a user from the database
 * @param {String} username
 * @returns {Promise}
 */
self.create = function(username) {
  return new User({username: username}).save()
  .then((user) => tokenService.encode(user));
};

/**
 * Remove a user from the database
 * @param {String} userId - mongoId of the user
 * @returns {Promise}
 */
self.destroy = function(userId) {
  return User.model.remove({userId: userId}).save();
};

export default self;
