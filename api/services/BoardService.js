/**
* BoardService: contains actions related to users and boards.
*/
import Promise from 'bluebird';
import { toPlainObject } from '../helpers/utils';
import { model as Board } from '../models/Board';
import { model as User } from '../models/User';
import { isNull } from './ValidatorService';
import { NotFoundError, ValidationError } from '../helpers/extendable-error';
import R from 'ramda';
// import Redis from '../helpers/key-val-store';
import inMemory from '../services/KeyValService';

const self = {};
const suffix = '-current-users';

/**
 * Create a board in the database
 * @returns {Promise<String|Error>} the created boards boardId
 */
self.create = function(userId) {
  return new Board({users: [userId], admins: [userId]}).save()
  .then((result) => result.boardId);
};

/**
 * Remove a board from the database
 * @param {String} boardId the boardId of the board to remove
 */
self.destroy = function(boardId) {
  return Board.remove({boardId: boardId});
};

/**
 * Find if a board exists
 * @param {String} boardId the boardId to check
 * @returns {Promise<Boolean|Error>} whether the board exists
 */
self.exists = function(boardId) {
  return Board.find({boardId: boardId}).limit(1)
  .then((r) => (r.length > 0) ? true : false);
};

/**
 * Find all users on a board
 * @TODO perhaps faster to grab userId's in Redis and find those Mongo docs?
 *       Would need to test performance of Query+Populate to Redis+FindByIds
 * @param {String} boardId the boardId to retrieve the users from
 * @returns {Promise<MongooseArray|Error>}
 */
self.getUsers = function(boardId) {
  return Board.findOne({boardId: boardId})
  .populate('users')
  .exec((board) => board.users);
};

/**
 * Find all admins on a board
 * @param {String} boardId the boardId to retrieve the admins from
 * @returns {Promise<MongooseArray|Error>}
 */
self.getAdmins = function(boardId) {
  return Board.findOne({boardId: boardId})
  .populate('admins')
  .exec((board) => board.admins);
};

/**
 * Find all pending users on a board
 * @param {String} boardId the boardId to retrieve the pendingUsers from
 * @returns {Promise<MongooseArray|Error>}
 */
self.getPendingUsers = function(boardId) {
  return Board.findOne({boardId: boardId})
  .populate('pendingUsers')
  .exec((board) => board.pendingUsers);
};

self.validateBoardAndUser = function(boardId, userId) {
  return Promise.join(Board.findOne({boardId: boardId}),
                      User.findById(userId))
  .then(([board, user]) => {
    if (isNull(board)) {
      throw new NotFoundError(`Board (${boardId}) does not exist`);
    }
    if (isNull(user)) {
      throw new NotFoundError(`User (${userId}) does not exist`);
    }
    return [board, user];
  });
};

/**
 * Adds a user to a board in Mongoose and Redis
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<[Mongoose,Redis]|Error> } resolves to a tuple response
 */
self.addUser = function(boardId, userId) {
  return self.validateBoardAndUser(boardId, userId)
  .then(([board, __]) => {
    if (self.isUser(board, userId)) {
      throw new ValidationError(
        `User (${userId}) already exists on the board (${boardId})`);
    }
    else {
      board.users.push(userId);
      return Promise.join(board.save(), inMemory.addUser(boardId, userId));
    }
  });
};

/**
 * Removes a user from a board in Mongoose and Redis
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<[Mongoose,Redis]|Error> } resolves to a tuple response
 */
self.removeUser = function(boardId, userId) {
  return self.validateBoardAndUser(boardId, userId)
  .then(([board, __]) => {
    if (!self.isUser(board, userId)) {
      throw new ValidationError(
        `User (${userId}) is not already on the board (${boardId})`);
    }
    else {
      board.users.pull(userId);
      return Promise.join(board.save(), inMemory.removeUser(boardId, userId));
    }
  });
};

/**
 * Add a user as an admin on a board
 * @param {String} boardId the boardId to add the admin to
 * @param {String} userId the userId to add as admin
 * @returns {Promise<MongooseObject|OperationalError>} user object that was added
 */
self.addAdmin = function(boardId, userId) {

  return Board.findOne({boardId: boardId})
  .then((board) => {
    const userOnThisBoard = self.isUser(board, userId);
    const adminOnThisBoard = self.isAdmin(board, userId);

    if (userOnThisBoard && !adminOnThisBoard) {
      board.admins.push(userId);
      return board.save();
    }
    else if (adminOnThisBoard) {
      throw new ValidationError(
        `User (${userId}) is already an admin on the board (${boardId})`);
    }
    else if (!userOnThisBoard) {
      throw new NotFoundError(
        `User (${userId}) does not exist on the board (${boardId})`);
    }
  });
};

/**
 * Checks whether a given user is on the given board synchronously
 * @XXX currently doesn't work with populated boards
 * @param {MongooseObject} board
 * @param {String} userId the userId to add as admin
 * @returns {Boolean} whether the user was on the board
 */
self.isUser = function(board, userId) {
  return R.contains(toPlainObject(userId), toPlainObject(board.users));
};

/**
 * Checks whether a given user is an admin on the given board
 * @XXX currently doesn't work with populated boards
 * @param {String} board
 * @param {String} userId the userId to add as admin
 * @returns {Promise<Boolean|Error>} whether the user was an admin
 */
self.isAdmin = function(board, userId) {
  return R.contains(toPlainObject(userId), toPlainObject(board.admins));
};

// Add user to currentUsers redis
// @deprecated
self.join = function(boardId, user) {
  return Redis.sadd(boardId + suffix, user);
};

// Remove user from currentUsers redis
// @deprecated
self.leave = function(boardId, user) {
  return Redis.srem(boardId + suffix, user);
};

// Get all currently connected users
// @deprecated
self.getConnectedUsers = function(boardId) {
  return Redis.smembers(boardId + suffix);
};

// self.isAdmin = function() {
//   return new Promise((res) => {
//     res(true);
//   });
// };

module.exports = self;
