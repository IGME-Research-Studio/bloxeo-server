/**
 * BoardService
 * contains actions related to users and boards.
 */

import Promise from 'bluebird';
import { isNil, isEmpty, not, contains } from 'ramda';

import { toPlainObject, strip, emptyDefaultTo } from '../helpers/utils';
import { NotFoundError, UnauthorizedError,
   NoOpError } from '../helpers/extendable-error';
import { model as Board } from '../models/Board';
import { adminEditableFields } from '../models/Board';
import { model as User } from '../models/User';
import inMemory from './KeyValService';
import IdeaCollectionService from './IdeaCollectionService';
import IdeaService from './IdeaService';
import { createIdeasAndIdeaCollections } from './StateService';

const self = {};

/**
 * Create a board in the database
 * @returns {Promise<String|Error>} the created boards boardId
 */
self.create = function(userId, name, description) {
  const boardName = emptyDefaultTo('Project Title', name);
  const boardDesc = emptyDefaultTo('This is a description.', description);

  return new Board({users: [userId], admins: [userId],
    name: boardName, description: boardDesc})
  .save()
  .then((result) => {
    return createIdeasAndIdeaCollections(result.boardId, false, '')
    .then(() => result.boardId);
  });
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

  if (not(contains(attribute, adminEditableFields))) {
    throw new UnauthorizedError(
      `Attribute is not editable or does not exist.`);
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
 * Find boards for user
 * @param {String} username
 * @returns {Promise<[MongooseObjects]|Error>} Boards for the given user
 */
self.getBoardsForUser = function(userId) {
  return Board.find({users: userId});
};

/**
* Gets the board that the socket is currently connected to
* @param {String} socketId
* @returns {Promise<MongoBoard|Error} returns the board of the connected socket
*/
self.getBoardForSocket = function(socketId) {
  return self.getUserFromSocket(socketId)
  .then((userId) => {
    return self.getBoardsForUser(userId);
  })
  .then(([board]) => board);
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
* Get the board options
* @param {String} boardId: id of the board
* @returns {Promise<Object|Error>}: returns an object with the board options
*/
self.getBoardOptions = function(boardId) {
  return Board.findOne({boardId: boardId})
  .select('-_id userColorsEnabled numResultsShown numResultsReturn name description')
  .then(toPlainObject)
  .then((board) => {
    if (isNil(board)) {
      throw new NotFoundError(`Board with id ${boardId} does not exist`);
    }

    return board;
  });
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
  .then((board) => toPlainObject(board))
  .then((board) => {
    if (isNil(board)) {
      throw new NotFoundError(`Board with id ${boardId} does not exist`);
    }

    return board;
  })
  .then(({users}) => {
    if (isEmpty(users)) {
      throw new NotFoundError(`Board with id ${boardId} has no users`);
    }

    return users;
  });
};

/**
* Gets the user id associated with a connected socket id
* @param {String} socketId
* @returns {Promise<String|Error>}
*/
self.getUserFromSocket = function(socketId) {
  return inMemory.getUserFromSocket(socketId);
};

/**
* Get all the connected users in a room from Redis
* @param {String} boardId
* @returns {Promise<Array|Error>} returns an array of user ids
*/
self.getAllUsersInRoom = function(boardId) {
  return inMemory.getUsersInRoom(boardId);
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
    if (isNil(board)) {
      throw new NotFoundError(
        `Board ${boardId} does not exist`, {board: boardId});
    }
    if (isNil(user)) {
      throw new NotFoundError(
        `User ${userId} does not exist`, {user: userId});
    }
    return [board, user];
  });
};

/**
 * Adds a user to a board in Mongoose and Redis
 * @param {String} boardId
 * @param {String} userId
 * @param {String} socketId
 * @returns {Promise<[Mongoose,Redis]|Error> } resolves to a tuple response
 */
self.addUser = function(boardId, userId, socketId) {
  return self.validateBoardAndUser(boardId, userId)
  .then(([board, __]) => {
    if (self.isUser(board, userId)) {
      return self.addUserToRedis(boardId, userId, socketId);
    }
    else {
      return Promise.all([
        self.addUserToMongo(board, userId),
        self.addUserToRedis(boardId, userId, socketId),
      ]);
    }
  })
  .return([socketId, userId]);
};

/**
 * Removes a user from a board in Mongoose and Redis
 * @param {String} boardId
 * @param {String} userId
 * @param {String} socketId
 * @returns {Promise<[Redis]|Error> } resolves to a Redis response
 */
self.removeUser = function(boardId, userId, socketId) {
  return self.validateBoardAndUser(boardId, userId)
  .then(([board, __]) => {
    if (!self.isUser(board, userId)) {
      throw new NoOpError(
        `No user with userId ${userId} to remove from boardId ${boardId}`);
    }
    else {
      // @TODO: When admins become fully implmented, remove user from mongo too
      return self.removeUserFromRedis(boardId, userId, socketId);
    }
  })
  .return([socketId, userId]);
};

/**
* Adds the user to a board on mongo
* @param {MongoBoard} board: the mongo board
* @param {String} userId
* @param {Promise<MongoBoard|Error>}
*/
self.addUserToMongo = function(board, userId) {
  board.users.push(userId);
  return board.save();
};

/**
* Removes the user from the board on mongo
* @param {String} boardId
* @param {String} userId
* @returns {Promise<MongoBoard|Error>}
*/
self.removeUserFromMongo = function(boardId, userId) {
  board.users.pull(userId);
  return board.save();
};

/**
* Adds the user id to redis
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<Array|Error>}
*/
self.addUserToRedis = function(boardId, userId, socketId) {
  return inMemory.addUser(boardId, userId, socketId);
};

/**
* Removes the user id from redis
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<Array|Error>}
*/
self.removeUserFromRedis = function(boardId, userId, socketId) {
  return inMemory.removeUser(boardId, userId, socketId);
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
      throw new NoOpError(
        `User ${userId} is already an admin on the board ${boardId}`,
        {user: userId, board: boardId});
    }
    else if (!userOnThisBoard) {
      throw new NotFoundError(
        `User ${userId} does not exist on the board ${boardId}`,
        {user: userId, board: boardId});
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
  return contains(toPlainObject(userId), toPlainObject(board.users));
};

/**
 * Checks whether a given user is an admin on the given board
 * @XXX currently doesn't work with populated boards
 * @param {String} board
 * @param {String} userId the userId to add as admin
 * @returns {Promise<Boolean|Error>} whether the user was an admin
 */
self.isAdmin = function(board, userId) {
  return contains(toPlainObject(userId), toPlainObject(board.admins));
};

self.errorIfNotAdmin = function(board, userId) {
  if (self.isAdmin(board, userId)) {
    return Promise.resolve(true);
  }
  else {
    throw new UnauthorizedError(
      `User ${userId} is not authorized to update board`,
      {user: userId});
  }
};

/**
* Checks if there are collections on the board
* @param {String} boardId: id of the board
* @returns {Promise<Boolean|Error>}: return if the board has collections or not
*/
self.areThereCollections = function(boardId) {
  return getIdeaCollections(boardId)
  .then((collections) => {
    if (collections.length > 0) {
      return true;
    }
    else {
      return false;
    }
  });
};

/**
* Generates all of the necessary board/room data to send to client
* @param {String} boardId
* @param {String} userId
* @returns {Promise<Object|Error>}: returns all of the generated board/room data
*/
self.hydrateRoom = function(boardId, userId) {
  const hydratedRoom = {};
  console.log(IdeaCollectionService);
  console.log(IdeaService);
  return Promise.all([
    Board.findOne({boardId: boardId}),
    getIdeaCollections(boardId),
    getIdeas(boardId),
    self.getBoardOptions(boardId),
    self.getUsers(boardId),
  ])
  .then(([board, collections, ideas, options, users]) => {
    hydratedRoom.collections = strip(collections);
    hydratedRoom.ideas = strip(ideas);
    hydratedRoom.room = { name: board.name,
                          description: board.description,
                          userColorsEnabled: options.userColorsEnabled,
                          numResultsShown: options.numResultsShown,
                          numResultsReturn: options.numResultsReturn };


    hydratedRoom.room.users = users.map(function(user) {
      return {userId: user._id, username: user.username};
    });

    return self.isAdmin(board, userId);
  })
  .then((isUserAnAdmin) => {
    hydratedRoom.isAdmin = isUserAnAdmin;
    return hydratedRoom;
  });
};

module.exports = self;
