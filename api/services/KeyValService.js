/**
 * KeyValService
 * A light wrapper around ioredis to encode our key/val store business logic
 *
 * The 'Schema', i.e. what we're storing and under which key
 *
 *  // State
 *  `${boardId}-state`: { createIdeaCollections,
 *                        createIdeaAndIdeaCollections,
 *                        voteOnIdeaCollections }
 *
 *  // Voting
 *  `${boardId}-voting-${usedId}`: [ref('IdeaCollections'), ...],
 *  `${boardId}-voting-ready`: [ref('Users'), ...],
 *  `${boardId}-voting-done`: [ref('Users'), ...],
 *
 *  // Users
 *  `${boardId}-current-users`: [ref('Users'), ...]
 */

import { contains, curry, uniq } from 'ramda';
import Redis from '../helpers/key-val-store';
import {NoOpError} from '../helpers/extendable-error';

const self = {};

// @TODO:
//        Modify the tests and make new unit tests for new features

/**
 * Use these as the sole way of creating keys to set in Redis
 */

// A Redis set created for every board
// It holds the user ids of users ready to vote
const votingReadyKey = (boardId) => `${boardId}-voting-ready`;
// A Redis set created for every board
// It holds the user ids of users done voting
const votingDoneKey = (boardId) => `${boardId}-voting-done`;
// A Redis set created for every user on every board
// It holds the ids of the idea collections that the user still has to vote on
// When empty the user is done voting
const votingListPerUser = curry((boardId, userId) => {
  return `${boardId}-voting-${userId}`;
});
// A Redis set created for every board
// It holds the socket ids of users currently in the board
const currentSocketConnectionsKey = (boardId) => `${boardId}-current-users`;
// A Redis set created for every socket connected to a board
// It holds the userId associated to a socket currently connected to the board
const socketUserIdSetKey = (socketId) => `socket-${socketId}-user`;
// A Redis string created for every board
// It holds a JSON string representing the state of the board
const stateKey = (boardId) => `${boardId}-state`;

/**
 * Takes the response of a mutating Redis actions (e.g. sadd) and throws a
 * NoOp Error if the action failed to change anything. Otherwise it just lets
 * the input fall through.
 * @param {Integer} numberOfOperations - result of a Redis call
 * @throws {NoOpError}
 * @returns {Integer}
 */
const maybeThrowIfNoOp = (numberOfOperations) => {
  if (numberOfOperations <= 0) throw new NoOpError('Redis call did nothing');
  else return numberOfOperations;
};

/**
 * Takes the response of a Redis creation action (e.g. set) and throws a
 * NoOp Error if the action was not succesful. Otherwise it returns true
 * @param {String} response - result of a Redis call
 * @throws {NoOpError}
 * @returns {True}
 */
const maybeThrowIfUnsuccessful = (response) => {
  if (response !== 'OK') throw new NoOpError('Redis call did not return OK');
  else return true;
};

/**
 * Takes the response of a Redis creation action (e.g. get) and throws a
 * NoOp Error if response is null or undefined. Otherwise it returns the response
 * @param {String} response - result of a Redis call
 * @throws {NoOpError}
 * @returns {String} the response from Redis
 */
const maybeThrowIfNull = (response) => {
  if (response) return response;
  else throw new NoOpError('Redis call did not find the key and returned null');
};

/**
 * Change a user's status in a room in redis
 * Curried for easy partial application
 * @example
 *  changeUser('add')(BOARDID, USERID)
 *  changeUser(R.__, BOARDID, USERID)('remove')
 * @param {'add'|'remove'} operation
 * @param {Function} keyGen method for creating the key when given the boardId
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<String|NoOpError|Error>}
 */
self.changeUser = curry((operation, keyGen, boardId, userId) => {
  let method;

  if (operation.toLowerCase() === 'add') method = 'sadd';
  else if (operation.toLowerCase() === 'remove') method = 'srem';
  else throw new Error(`Invalid operation ${operation}`);

  return Redis[method](keyGen(boardId), userId)
    .then(maybeThrowIfNoOp)
    .then(() => userId);
});
/**
* @param {'add'|'remove'} operation
* @param {Function} keyGen1 method for creating the key when given the boardId
* @param {Function} keyGen2 method for creating the key when given the socketId
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<Array|NoOpError|Error>} Returns an array of the socketId and userId
*/
self.changeConnectedUser = curry((operation, keyGen1, keyGen2, boardId, userId, socketId) => {
  let method;

  if (operation.toLowerCase() === 'add') method = 'sadd';
  else if (operation.toLowerCase() === 'remove') method = 'srem';
  else throw new Error(`Invalid operation ${operation}`);

  return Promise.all([
    Redis[method](keyGen1(boardId), socketId),
    Redis[method](keyGen2(socketId), userId),
  ])
  .then(([operation1, operation2]) => {
    return maybeThrowIfNoOp(operation1 + operation2);
  })
  .then(() => [socketId, userId]);
});

/**
 * Get the userId associated with a socketId
 * @param {String} userId
 * @returns {Promise<String|Error>} resolves to a userId
 */
self.getUser = curry((keyGen, socketId) => {
  return Redis.smembers(keyGen(socketId))
  .then(([userId]) => {
    return userId;
  });
});

/**
 * Get all the users currently connected to the room
 * @param {String} boardId
 * @returns {Promise<Array|Error>} resolves to an array of userIds
 */
self.getUsers = curry((keyGen1, keyGen2, boardId) => {
  return Redis.smembers(keyGen1(boardId))
  .then((socketIds) => {
    const socketSetKeys = socketIds.map(function(socketId) {
      return keyGen2(socketId);
    });

    return socketSetKeys.map(function(socketSetKey) {
      return Redis.smembers(socketSetKey)
      .then(([userId]) => userId );
    });
  })
  .then((promises) => {
    return Promise.all(promises);
  })
  .then((userIds) => {
    return uniq(userIds);
  });
});

/**
 * Change a user's vote list in a room in redis
 * @param {'add'|'remove'} operation
 * @param {Function} keyGen method for creating the key when given the boardId
 * @param {String} boardId
 * @param {String} userId
 * @param {Array|String} val - Array of collection keys or single collection key
 * @returns {Promise<Array|String|NoOpError|Error>}
 */
self.changeUserVotingList = curry((operation, keyGen, boardId, userId, val) => {
  let method;

  if (operation.toLowerCase() === 'add') method = 'sadd';
  else if (operation.toLowerCase() === 'remove') method = 'srem';
  else throw new Error(`Invalid operation ${operation}`);

  return Redis[method](keyGen(boardId, userId), val)
  .then(maybeThrowIfNoOp)
  .then(() => val);
});

/**
 * Get all the collection keys to vote on currently for a particular user id
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Array|Error>} resolves to an array of collection keys
 */
self.getUserVotingList = curry((keyGen, boardId, userId) => {
  return Redis.smembers(keyGen(boardId, userId));
});

/**
 * Deletes the key in Redis generated by the keygen(boardId)
 * @param {Function} keyGen
 * @param {String} boardId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.clearKey = curry((keyGen, boardId) => {
  return Redis.del(keyGen(boardId))
    .then(maybeThrowIfNoOp);
});

/**
* Clears the set of collection keys to vote on
* @param {Function} keyGen
* @param {String} boardId
* @param {String} userId
* @returns {Promise<Int|Error>}
*/
self.clearVotingSetKey = curry((keyGen, boardId, userId) => {
  return Redis.del(keyGen(boardId, userId))
    .then(maybeThrowIfNoOp);
});

/**
 * Sets a JSON string version of the given val to the key generated
 * by keyGen(boardId)
 * @param {Function} keyGen
 * @param {String} boardId
 * @param {String} val
 * @returns {Promise<True|NoOpError|Error>}
 */
self.setKey = curry((keyGen, boardId, val) => {
  return Redis.set(keyGen(boardId), JSON.stringify(val))
    .then(maybeThrowIfUnsuccessful);
});

/**
 * Gets a string for the given key generated by keyGen(boardId) and parses it
 * back out to an object if the string is valid JSON.
 * @param {Function} keyGen
 * @param {String} boardId
 * @returns {Promise<String|Object|NoOpError|Error>}
 */
self.getKey = curry((keyGen, boardId) => {
  return Redis.get(keyGen(boardId))
  .then(maybeThrowIfNull)
  .then((response) => JSON.parse(response))
  .catch(() => response);
});

/**
 * @param {Function} keyGen1
 * @param {Function} keyGen2
 * @param {String} boardId
 * @param {String} val
 * @returns {Promise<Boolean|Error>}
 */
self.checkIfUserIsInRoom = curry((keyGen1, keyGen2, boardId, val) => {
  return self.getUsers(keyGen1, keyGen2, boardId)
  .then((users) => {
    return contains(val, users);
  });
});

/**
 * @param {Function} keyGen
 * @param {String} boardId
 * @returns {Promise<Boolean|Error>}
 */
self.checkKey = curry((keyGen, boardId) => {
  return Redis.exists((keyGen(boardId)))
  .then((ready) => ready === 1);
});

/**
 * @param {Function} keyGen
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Boolean|Error>}
 */
self.checkSetExists = curry((keyGen, boardId, userId) => {
  return Redis.exists((keyGen(boardId, userId)))
  .then((ready) => ready === 1);
});

/**
 * Publicly available (curried) API for modifying Redis
 */

/**
 * @param {String} boardId
 * @param {String} userId
 * @param {String} socketId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.addUser = self.changeConnectedUser('add', currentSocketConnectionsKey, socketUserIdSetKey);
self.removeUser = self.changeConnectedUser('remove', currentSocketConnectionsKey, socketUserIdSetKey);

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.readyUserToVote = self.changeUser('add', votingReadyKey);
self.readyUserDoneVoting = self.changeUser('add', votingDoneKey);

/**
 * @param {String} boardId
 * @param {String} userId
 * @param {Array|String} val - array of strings or single string
 * @returns {Promise<Array|String|NoOpError|Error>} - the val passed in
 */
self.addToUserVotingList = self.changeUserVotingList('add', votingListPerUser);
self.removeFromUserVotingList = self.changeUserVotingList('remove', votingListPerUser);

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Array|NoOpError|Error>} - the array of members in the set
 */
self.getCollectionsToVoteOn = self.getUserVotingList(votingListPerUser);
self.checkUserVotingListExists = self.checkSetExists(votingListPerUser);
self.clearUserVotingList = self.clearVotingSetKey(votingListPerUser);

/**
 * @param {String} socketId
 * @returns {Promise<Integer|Error>}
 */
self.getUserFromSocket = self.getUser(socketUserIdSetKey);

/**
 * @param {String} boardId
 * @returns {Promise<Integer|Error>}
 */
self.getUsersInRoom = self.getUsers(currentSocketConnectionsKey, socketUserIdSetKey);
self.getUsersDoneVoting = self.getUsers(votingDoneKey);
self.getUsersReadyToVote = self.getUsers(votingReadyKey);

/**
 * @param {String} boardId
 * @returns {Promise<Integer|Error>}
 */
self.clearCurrentSocketConnections = self.clearKey(currentSocketConnectionsKey);
self.clearCurrentSocketUserIds = self.clearKey(socketUserIdSetKey);
self.clearVotingReady = self.clearKey(votingReadyKey);
self.clearVotingDone = self.clearKey(votingDoneKey);

/**
 * @param {String} boardId
 * @param {Object|Array|String} value - what the key points to
 * @returns {Promise<True|NoOpError|Error>}
 */
self.setBoardState = self.setKey(stateKey);
self.checkBoardStateExists = self.checkKey(stateKey);
self.clearBoardState = self.clearKey(stateKey);

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<True|NoOpError|Error>}
 */
self.isUserInRoom = self.checkIfUserIsInRoom(currentSocketConnectionsKey, socketUserIdSetKey);

/**
* @param {String} boardId
* @returns {Promise<String|Object|NoOpError|Error>}
*/
self.getBoardState = self.getKey(stateKey);

// @TODO unnecessary? Poorly named? Leaving just for completeness-sake.
self.unreadyUser = self.changeUser('remove', votingReadyKey);
self.unfinishVoteUser = self.changeUser('remove', votingDoneKey);

export default self;
