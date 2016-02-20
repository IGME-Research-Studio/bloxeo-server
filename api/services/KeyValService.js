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

import Redis from '../helpers/key-val-store';
import {NoOpError} from '../helpers/extendable-error';
import R from 'ramda';

const self = {};

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
// const votingListPerUser = R.curry((boardId, userId) => {
//   return `${boardId}-voting-${userId}`;
// });
// A Redis set created for every board
// It holds the user ids of users currently in the board
const currentUsersKey = (boardId) => `${boardId}-current-users`;
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
 * @returns {True}
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
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.changeUser = R.curry((operation, keyGen, boardId, userId) => {
  let method;

  if (operation.toLowerCase() === 'add') method = 'sadd';
  else if (operation.toLowerCase() === 'remove') method = 'srem';
  else throw new Error(`Invalid operation ${operation}`);

  return Redis[method](keyGen(boardId), userId)
    .then(maybeThrowIfNoOp)
    .then(() => userId);
});

/**
 * Get all the users currently connected to the room
 * @param {String} boardId
 * @returns {Promise<Array|Error>} resolves to an array of userIds
 */
self.getUsers = R.curry((keyGen, boardId) => {
  return Redis.smembers(keyGen(boardId), boardId);
});

/**
 * Deletes the key in Redis generated by the keygen(boardId)
 * @param {Function} keyGen
 * @param {String} boardId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.clearKey = R.curry((keyGen, boardId) => {
  return Redis.del(keyGen(boardId))
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
self.setKey = R.curry((keyGen, boardId, val) => {
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
self.getKey = R.curry((keyGen, boardId) => {
  return Redis.get(keyGen(boardId))
  .then(maybeThrowIfNull)
  .then((response) => JSON.parse(response))
  .catch(() => response);
});

/**
 * @param {Function} keyGen
 * @param {String} boardId
 * @param {String} val
 * @returns {Promise<Boolean|Error>}
 */
self.checkSet = R.curry((keyGen, boardId, val) => {
  return Redis.sismember((keyGen(boardId), val))
  .then((ready) => ready === 1);
});

/**
 * @param {Function} keyGen
 * @param {String} boardId
 * @param {String} val
 * @returns {Promise<Boolean|Error>}
 */
self.checkKey = R.curry((keyGen, boardId, val) => {
  return Redis.exists((keyGen(boardId), val))
  .then((ready) => ready === 1);
});

/**
 * Publicly available (curried) API for modifying Redis
 */

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.addUser = self.changeUser('add', currentUsersKey);
self.removeUser = self.changeUser('remove', currentUsersKey);
self.readyUser = self.changeUser('add', votingReadyKey);
self.finishVoteUser = self.changeUser('add', votingDoneKey);

/**
 * @param {String} boardId
 * @returns {Promise<Integer|Error>}
 */
self.getUsersInRoom = self.getUsers(currentUsersKey);
self.getUsersDoneVoting = self.getUsers(votingDoneKey);
self.getUsersReadyToVote = self.getUsers(votingReadyKey);

/**
 * @param {String} boardId
 * @returns {Promise<Integer|Error>}
 */
self.clearCurrentUsers = self.clearKey(currentUsersKey);
self.clearVotingReady = self.clearKey(votingReadyKey);
self.clearVotingDone = self.clearKey(votingDoneKey);

/**
 * @param {String} boardId
 * @param {Object|Array|String} value - what the key points to
 * @returns {Promise<True|NoOpError|Error>}
 */
self.setBoardState = self.setKey(stateKey);

/**
* @param {String} boardId
* @returns {Promise<String|Object|NoOpError|Error>}
*/
self.getBoardState = self.getKey(stateKey);

// @TODO unnecessary? Poorly named? Leaving just for completeness-sake.
self.unreadyUser = self.changeUser('remove', votingReadyKey);
self.unfinishVoteUser = self.changeUser('remove', votingDoneKey);

export default self;
