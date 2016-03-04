/**
* UserService: contains actions related to users and boards.
*
* @file Contains logic for User related actions
* @module UserService api/services/UserService
*/

import tokenService from './TokenService';
import { model as User } from '../models/User';
import { toPlainObject } from '../helpers/utils';

const self = {};

/**
 * Create a user from the database
 * @param {String} username
 * @returns {Promise}
 */
self.create = function(username) {
  return new User({username: username}).save()
  .then((user) => tokenService.encode(toPlainObject(user)));
};

/**
 * Remove a user from the database
 * @XXX This does not look like the correct way to query for a user
 * @param {String} userId - mongoId of the user
 * @returns {Promise}
 */
self.destroy = function(userId) {
  return User.model.remove({userId: userId}).save();
};

export default self;
