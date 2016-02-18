/**
* BoardService: contains actions related to users and boards.
*/
import Promise from 'bluebird';
import { toPlainObject } from '../helpers/utils';
import { model as Board } from '../models/Board';
import { adminEditableFields } from '../models/Board';
import { model as User } from '../models/User';
import { isNull } from './ValidatorService';
import { NotFoundError, ValidationError, UnauthorizedError } from '../helpers/extendable-error';
import R from 'ramda';
import Redis from '../helpers/key-val-store';

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
* Update a board's name and description in the database
* @param {Document} board - The mongo board model to update
* @param {String} attribute - The attribute to update
* @param {String} value - The value to update the attribute with
* @returns {Document} - The updated mongo board model
*/
self.update = function(board, attribute, value) {

  if (adminEditableFields.indexOf(attribute) === -1) {
    throw new UnauthorizedError('Attribute is not editable or does not exist.');
  }
  const query = {};
  const updatedData = {};
  query[attribute] = board[attribute];
  updatedData[attribute] = value;

  return board.update(query, updatedData);
};

/**
* Find a board with populated users and admins
* @param {String} boardId - the boardId to check
* @returns {Promise<Board|Error>} - The mongo board model found
*/
self.findBoard = function(boardId) {
  return Board.findBoard(boardId);
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

self.addUser = function(boardId, userId) {
  return Promise.join(Board.findOne({boardId: boardId}),
                      User.findById(userId))
  .then(([board, user]) => {
    if (isNull(board)) {
      throw new NotFoundError(`Board (${boardId}) does not exist`);
    }
    else if (isNull(user)) {
      throw new NotFoundError(`User (${userId}) does not exist`);
    }
    else if (self.isUser(board, userId)) {
      throw new ValidationError(
        `User (${userId}) already exists on the board (${boardId})`);
    }
    else {
      board.users.push(userId);
      return board.save();
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

self.errorIfNotAdmin = function(board, userId) {
  if (isAdmin(board, userId)) {
    return true;
  }
  else {
    throw new UnauthorizedError('User is not authorized to update board');
  }
};

// add user to currentUsers redis
self.join = function(boardId, user) {
  return Redis.sadd(boardId + suffix, user);
};

// remove user from currentUsers redis
self.leave = function(boardId, user) {
  return Redis.srem(boardId + suffix, user);
};

// get all currently connected users
self.getConnectedUsers = function(boardId) {
  return Redis.smembers(boardId + suffix);
};

module.exports = self;
