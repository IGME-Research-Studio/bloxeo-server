/**
* UserService: contains actions related to users and boards.
*
* @file Contains logic for User related actions
* @module UserService api/services/UserService
*/

import tokenService from './TokenService';
import { model as User } from '../models/Idea.js';
import { toClient, errorHandler } from '../services/utils';

const userService = {};

/**
 * Create a user from the database
 * @param {String} username
 * @returns {Promise}
 */
userService.create = function(username) {
  return new User({username: username}).save()
  .then((user) => tokenService.generateNewToken(user))
  .then(toClient)
  .catch(errorHandler);
};

/**
 * Remove a user from the database
 * @param {String} userId - mongoId of the user
 * @returns {Promise}
 */
userService.destroy = function(userId) {

  return User.model.remove({userId: userId}).save();
};

export default userService;
