/**
 * BoardService
 * contains actions related to users and boards.
 */

import Promise from 'bluebird';
import { isNil, isEmpty, pick, contains, find, propEq, map } from 'ramda';

import { toPlainObject, stripNestedMap,
  stripMap, emptyDefaultTo } from '../helpers/utils';
import { NotFoundError, UnauthorizedError,
   NoOpError } from '../helpers/extendable-error';
import { model as Board } from '../models/Board';
import { adminEditableFields } from '../models/Board';
import { model as User } from '../models/User';
import { isSocketInRoom, removeConnectedUser, addConnectedUser,
  getUserFromSocket, getUsersInRoom } from './KeyValService';
import { getIdeaCollections } from './IdeaCollectionService';
import { getIdeas } from './IdeaService';
import { createIdeasAndIdeaCollections } from './StateService';
import { isRoomReadyToVote, isRoomDoneVoting } from './VotingService';

const maybeThrowNotFound = (obj, msg = 'Board not found') => {
  if (isNil(obj)) {
    throw new NotFoundError(msg);
  }
  else {
    return Promise.resolve(obj);
  }
};

/**
* Create a board in the database
* @returns {Promise<String|Error>} the created boards boardId
*/
export const create = function(userId, name, desc) {
  const boardName = emptyDefaultTo('Project Title', name);
  const boardDesc = emptyDefaultTo('This is a description.', desc);

  return new Board({users: [userId], admins: [userId], boardName, boardDesc})
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
export const destroy = function(boardId) {
  return Board.remove({boardId: boardId});
};

/**
* Find a board with populated users and admins
* @param {String} boardId - the boardId to check
* @returns {Promise<Board|Error>} - The mongo board model found
*/
export const findBoard = function(boardId) {
  return Board.findBoard(boardId);
};

/**
* Update a board's name and boardDesc in the database
* @param {Document} board - The mongo board model to update
* @param {Object<String, Type} updates - The attribute to update
* @returns {Document} - The updated mongo board model
*/
export const update = function(board, updates) {
  const safeUpdates = pick(adminEditableFields, updates);

  if (isEmpty(safeUpdates)) {
    throw new UnauthorizedError(
      `Attributes are not editable or does not exist.`);
  }

  return board.update(safeUpdates)
  .then(() => findBoard(board.boardId))
  .then((updatedBoard) =>
        pick(adminEditableFields, toPlainObject(updatedBoard)));
};

/**
* Find boards for user
* @param {String} username
* @returns {Promise<[MongooseObjects]|Error>} Boards for the given user
*/
export const getBoardsForUser = function(userId) {
  return Board.find({users: userId})
    .then(maybeThrowNotFound);
};

/**
* Find if a board exists
* @param {String} boardId the boardId to check
* @returns {Promise<Boolean|Error>} whether the board exists
*/
export const exists = function(boardId) {
  return Board.find({boardId: boardId}).limit(1)
  .then((r) => (r.length > 0) ? true : false);
};

/**
* Get the board options
* @param {String} boardId: id of the board
* @returns {Promise<Object|Error>}: returns an object with the board options
*/
export const getBoardOptions = function(boardId) {
  return Board.findOne({boardId: boardId})
  .select('-_id userColorsEnabled numResultsShown numResultsReturn boardName boardDesc')
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
export const getUsers = function(boardId) {
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
export const getUserIdFromSocketId = function(socketId) {
  return getUserFromSocket(socketId);
};

/**
* Get all the connected users in a room from Redis
* @param {String} boardId
* @returns {Promise<Array|Error>} returns an array of user ids
*/
export const getAllUsersInRoom = function(boardId) {
  return getUsersInRoom(boardId);
};

/**
* Find all admins on a board
* @param {String} boardId the boardId to retrieve the admins from
* @returns {Promise<MongooseArray|Error>}
*/
export const getAdmins = function(boardId) {
  return Board.findOne({boardId: boardId})
  .populate('admins')
  .exec((board) => board.admins);
};

/**
* Find all pending users on a board
* @param {String} boardId the boardId to retrieve the pendingUsers from
* @returns {Promise<MongooseArray|Error>}
*/
export const getPendingUsers = function(boardId) {
  return Board.findOne({boardId: boardId})
  .populate('pendingUsers')
  .exec((board) => board.pendingUsers);
};

export const validateBoardAndUser = function(boardId, userId) {
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
* Adds the user to a board on mongo
* @param {MongoBoard} board: the mongo board
* @param {String} userId
* @param {Promise<MongoBoard|Error>}
*/
export const addUserToMongo = function(board, userId) {
  board.users.push(userId);
  return board.save();
};

/**
* Removes the user from the board on mongo
* @param {String} boardId
* @param {String} userId
* @returns {Promise<MongoBoard|Error>}
*/
export const removeUserFromMongo = function(boardId, userId) {
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
export const addUserToRedis = function(boardId, userId, socketId) {
  return addConnectedUser(boardId, userId, socketId);
};

/**
* Removes the user id from redis
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<Array|Error>}
*/
export const removeUserFromRedis = function(boardId, userId, socketId) {
  return removeConnectedUser(boardId, userId, socketId);
};

/**
* Checks whether a given user is on the given board synchronously
* @XXX currently doesn't work with populated boards
* @param {MongooseObject} board
* @param {String} userId the userId to add as admin
* @returns {Boolean} whether the user was on the board
*/
export const isUser = function(board, userId) {
  return contains(toPlainObject(userId), toPlainObject(board.users));
};

/**
* Checks whether a given user is an admin on the given board
* @XXX currently doesn't work with populated boards
* @param {String} board
* @param {String} userId the userId to add as admin
* @returns {Promise<Boolean|Error>} whether the user was an admin
*/
export const isAdmin = function(board, userId) {
  return contains(toPlainObject(userId), toPlainObject(board.admins));
};

/**
* Adds a user to a board in Mongoose and Redis
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<[Mongoose,Redis]|Error> } resolves to a tuple response
*/
export const addUser = function(boardId, userId, socketId) {
  return validateBoardAndUser(boardId, userId)
  .then(([board, __]) => {
    if (isUser(board, userId)) {
      return addUserToRedis(boardId, userId, socketId);
    }
    else {
      return Promise.all([
        addUserToMongo(board, userId),
        addUserToRedis(boardId, userId, socketId),
      ]);
    }
  })
  .return(userId);
};

/**
 * Add a user as an admin on a board
 * @param {String} boardId the boardId to add the admin to
 * @param {String} userId the userId to add as admin
 * @returns {Promise<MongooseObject|OperationalError>} user object that was added
 */
export const addAdmin = function(boardId, userId) {
  return Board.findOne({boardId: boardId})
  .then((board) => {
    const userOnThisBoard = isUser(board, userId);
    const adminOnThisBoard = isAdmin(board, userId);

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

export const errorIfNotAdmin = function(board, userId) {
  if (isAdmin(board, userId)) {
    return Promise.resolve([board, userId]);
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
export const areThereCollections = function(boardId) {
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
export const hydrateRoom = function(boardId) {
  const hydratedRoom = {};
  return Promise.all([
    Board.findOne({boardId: boardId}),
    getIdeaCollections(boardId),
    getIdeas(boardId),
    getBoardOptions(boardId),
    getAllUsersInRoom(boardId),
    getUsers(boardId),
  ])
  .then(([board, collections, ideas, options, userIds, usersOnBoard]) => {
    hydratedRoom.collections = stripNestedMap(collections);
    hydratedRoom.ideas = stripMap(ideas);
    hydratedRoom.room = { boardName: board.boardName,
                          boardDesc: board.boardDesc,
                          userColorsEnabled: options.userColorsEnabled,
                          numResultsShown: options.numResultsShown,
                          numResultsReturn: options.numResultsReturn };

    const users = map((anId) => (
      find(propEq('_id', anId), usersOnBoard)
    ), userIds);

    hydratedRoom.room.users = users.map((user) => {
      return {
        userId: user._id,
        username: user.username,
        isAdmin: isAdmin(board, user._id),
      };
    });

    return hydratedRoom;
  });
};

export const handleLeavingUser = (userId, socketId) =>
  getBoardsForUser(userId)
  .then((boards) => Promise.filter(boards, () => {
    return isSocketInRoom(socketId);
  }))
  .get(0)
  .then((board) => Promise.all([
    removeUserFromRedis(board.boardId, userId, socketId),
    Promise.resolve(board.boardId),
  ]))
  .tap(([/* userId */, boardId]) => Promise.all([
    isRoomReadyToVote(boardId),
    isRoomDoneVoting(boardId),
  ]));

export const handleLeaving = (socketId) =>
  getUserIdFromSocketId(socketId)
    .then((userId) => handleLeavingUser(userId, socketId));
