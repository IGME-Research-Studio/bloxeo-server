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

import { contains, curry, uniq, unless } from 'ramda';
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
// A Redis key for socketId: userId combos
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

const trueOrFalse = (response) => {
  if (response === 1) return true;
  else return false;
};

self.getSetMembers = curry((setKeyGen, boardId) => {
  return Redis.smembers(setKeyGen(boardId));
});

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

  console.log(userId);
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
 * Gets a string for the given key generated by keyGen(boardId)
 * @param {Function} keyGen
 * @param {String} boardId
 * @returns {Promise<String|Object|NoOpError|Error>}
 */
self.getKey = curry((keyGen, boardId) => {
  return Redis.get(keyGen(boardId))
  .then(maybeThrowIfNull);
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
 * @param {String} socketId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.connectSocketToRoom = self.changeUser('add',
                                           currentSocketConnectionsKey);
self.disconnectSocketFromRoom = self.changeUser('remove',
                                                currentSocketConnectionsKey);

/**
 * Create or delete a socket : user pair, using the socketId
 * @param {String} socketId
 * @param {String} userId
 */
self.connectSocketToUser = self.setKey(socketUserIdSetKey);
self.disconnectSocketFromUser = self.clearKey(socketUserIdSetKey);

/**
* @param {'add'|'remove'} operation
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<Array|NoOpError|Error>} Returns an array of the socketId and userId
*/
self.addConnectedUser = curry((boardId, userId, socketId) => {
  return Promise.all([
    self.connectSocketToUser(socketId, userId),
    self.connectSocketToRoom(socketId, userId),
  ])
  .then(() => [boardId, userId, socketId]);
});

/**
 * Disconnects socket from given room, but does not disassociate it from its
 * user. If that was the last connection the user had to the room, then
 * remove them from the relevant voting lists
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
 */
self.removeConnectedUser = curry((boardId, userId, socketId) => {
  return self.disconnectSocketFromRoom(boardId, socketId)
  .then(() => self.isUserInRoom(boardId, userId))
  .then((isInRoom) => {
    return unless(isInRoom, () => Promise.all([
      self.unreadyUser(boardId, userId),
      self.unfinishVoteUser(boardId, userId),
    ]));
  })
  .then(() => [boardId, userId, socketId]);
});

/**
 * @param {String} socketId
 * @returns {Promise<Integer|Error>}
 */
self.getUserFromSocket = self.getKey(socketUserIdSetKey);

/**
 * Get all the users currently connected to the room
 * @param {String} boardId
 * @returns {Promise<Array|Error>} resolves to an array of userIds
 */
self.getUsersInRoom = (boardId) => {
  return self.getSetMembers(currentSocketConnectionsKey, boardId)
  .then((socketIds) => Promise.map(socketIds, socketUserIdSetKey))
  .then(uniq);
};

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<True|NoOpError|Error>}
 */
self.isUserInRoom = curry((boardId, userId) => {
  return self.getUsersInRoom(boardId)
  .then((users) => contains(userId, users));
});

self.isSocketInRoom = curry((boardId, socketId) => {
  return Redis.sismember(currentSocketConnectionsKey(boardId), socketId)
  .then(trueOrFalse);
});

self.getUsersDoneVoting = self.getSetMembers(votingDoneKey);
self.getUsersReadyToVote = self.getSetMembers(votingReadyKey);

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
* @returns {Promise<String|Object|NoOpError|Error>}
*/
self.getBoardState = self.getKey(stateKey);

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

self.unreadyUser = self.changeUser('remove', votingReadyKey);
self.unfinishVoteUser = self.changeUser('remove', votingDoneKey);

export default self;
