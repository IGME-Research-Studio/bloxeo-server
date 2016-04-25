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

import { contains, curry, equals, unless, uniq } from 'ramda';
import Redis from '../helpers/key-val-store';
import {NoOpError} from '../helpers/extendable-error';
import Promise from 'bluebird';
import {StateEnum} from './StateService';

// @TODO:
// Modify the tests and make new unit tests for new features

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

export const getSetMembers = curry((setKeyGen, boardId) => {
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
export const changeUser = curry((operation, keyGen, boardId, userId) => {
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
export const changeUserVotingList = curry((operation, keyGen, boardId, userId, val) => {
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
export const getUserVotingList = curry((keyGen, boardId, userId) => {
  return Redis.smembers(keyGen(boardId, userId));
});

/**
* Clears the set of collection keys to vote on
* @param {Function} keyGen
* @param {String} boardId
* @param {String} userId
* @returns {Promise<Int|Error>}
*/
export const clearVotingSetKey = curry((keyGen, boardId, userId) => {
  return Redis.del(keyGen(boardId, userId))
    .then(maybeThrowIfNoOp);
});

/**
 * Sets a JSON string version of the given val to the key generated
 * by keyGen(boardId)
 * @param {Function} keyGen
 * @param {String} id
 * @param {Object} val
 * @returns {Promise<True|NoOpError|Error>}
 */
export const setObjectKey = curry((keyGen, id, val) => {
  return Redis.set(keyGen(id), JSON.stringify(val))
    .then(maybeThrowIfUnsuccessful);
});

/**
 * Sets a JSON string version of the given val to the key generated
 * by keyGen(boardId)
 * @param {Function} keyGen
 * @param {String} id
 * @param {String} val
 * @returns {Promise<True|NoOpError|Error>}
 */
export const setStringKey = curry((keyGen, id, val) => {
  return Redis.set(keyGen(id), val)
    .then(maybeThrowIfUnsuccessful);
});

/**
 * Gets a string for the given key generated by keyGen(id)
 * @param {Function} keyGen
 * @param {String} id
 * @returns {Promise<String|Object|NoOpError|Error>}
 */
export const getKey = curry((keyGen, id) => {
  return Redis.get(keyGen(id))
  .then(maybeThrowIfNull);
});

/**
 * Deletes the key in Redis generated by the keygen(id)
 * @param {Function} keyGen
 * @param {String} id
 * @returns {Promise<Integer|NoOpError|Error>}
 */
export const clearKey = curry((keyGen, id) => {
  return Redis.del(keyGen(id))
    .then(maybeThrowIfNoOp);
});

/**
 * @param {Function} keyGen
 * @param {String} boardId
 * @returns {Promise<Boolean|Error>}
 */
export const checkKey = curry((keyGen, boardId) => {
  return Redis.exists((keyGen(boardId)))
  .then((ready) => ready === 1);
});

/**
 * @param {Function} keyGen
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Boolean|Error>}
 */
export const checkSetExists = curry((keyGen, boardId, userId) => {
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
export const connectSocketToRoom = changeUser('add',
                                           currentSocketConnectionsKey);
export const disconnectSocketFromRoom = changeUser('remove',
                                                currentSocketConnectionsKey);

/**
 * Create or delete a socket : user pair, using the socketId
 * @param {String} socketId
 * @param {String} userId
 */
export const connectSocketToUser = setStringKey(socketUserIdSetKey);
export const disconnectSocketFromUser = clearKey(socketUserIdSetKey);


export const getUsersDoneVoting = getSetMembers(votingDoneKey);
export const getUsersReadyToVote = getSetMembers(votingReadyKey);

/**
 * @param {String} boardId
 * @returns {Promise<Integer|Error>}
 */
export const clearCurrentSocketConnections = clearKey(currentSocketConnectionsKey);
export const clearCurrentSocketUserIds = clearKey(socketUserIdSetKey);
export const clearVotingReady = clearKey(votingReadyKey);
export const clearVotingDone = clearKey(votingDoneKey);

/**
 * @param {String} boardId
 * @param {Object|Array|String} value - what the key points to
 * @returns {Promise<True|NoOpError|Error>}
 */
export const setBoardState = setObjectKey(stateKey);
export const checkBoardStateExists = checkKey(stateKey);
export const clearBoardState = clearKey(stateKey);

/**
* @param {String} boardId
* @returns {Promise<String|Object|NoOpError|Error>}
*/
export const getBoardState = getKey(stateKey);

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
export const readyUserToVote = changeUser('add', votingReadyKey);
export const readyUserDoneVoting = changeUser('add', votingDoneKey);

/**
 * @param {String} boardId
 * @param {String} userId
 * @param {Array|String} val - array of strings or single string
 * @returns {Promise<Array|String|NoOpError|Error>} - the val passed in
 */
export const addToUserVotingList = changeUserVotingList('add', votingListPerUser);
export const removeFromUserVotingList = changeUserVotingList('remove', votingListPerUser);

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Array|NoOpError|Error>} - the array of members in the set
 */
export const getCollectionsToVoteOn = getUserVotingList(votingListPerUser);
export const checkUserVotingListExists = checkSetExists(votingListPerUser);
export const clearUserVotingList = clearVotingSetKey(votingListPerUser);

export const unreadyUser = changeUser('remove', votingReadyKey);
export const unfinishVoteUser = changeUser('remove', votingDoneKey);

/**
 * @param {String} socketId
 * @returns {Promise<Integer|Error>}
 */
export const getUserFromSocket = getKey(socketUserIdSetKey);

/**
 * Get all the users currently connected to the room
 * @todo filter list of users to make sure no duplicate users are sent back
 * @param {String} boardId
 * @returns {Promise<Array|Error>} resolves to an array of userIds
 */
export const getUsersInRoom = (boardId) => {
  return getSetMembers(currentSocketConnectionsKey, boardId)
  .then((socketIds) => {
    const userIdPromises = socketIds.map((socketId) => {
      return getUserFromSocket(socketId);
    });

    return Promise.all(userIdPromises)
    .then((userIds) => {
      return uniq(userIds);
    });
  });
};

/**
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<True|NoOpError|Error>}
 */
export const isUserInRoom = curry((boardId, userId) => {
  return getUsersInRoom(boardId)
  .then((users) => contains(userId, users));
});

export const isSocketInRoom = curry((boardId, socketId) => {
  return Redis.sismember(currentSocketConnectionsKey(boardId), socketId)
  .then(trueOrFalse);
});

/**
* @param {'add'|'remove'} operation
* @param {String} boardId
* @param {String} userId
* @param {String} socketId
* @returns {Promise<Array|NoOpError|Error>} Returns an array of the socketId and userId
*/
export const addConnectedUser = curry((boardId, userId, socketId) => {
  return Promise.all([
    connectSocketToUser(socketId, userId),
    connectSocketToRoom(boardId, socketId),
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
export const removeConnectedUser = curry((boardId, userId, socketId) => {
  return disconnectSocketFromRoom(boardId, socketId)
  .then(() => isUserInRoom(boardId, userId))
  .then((isInRoom) => {
    return unless(isInRoom, () => {
      // Get current state to determine which ready list to remove the user from
      return getBoardState(boardId);
    });
  })
  .then((boardState) => {
    const createCollectionsState = StateEnum.createIdeaCollections;
    const createIdeasAndCollectionsState = StateEnum.createIdeasAndIdeaCollections;
    const voteOnIdeaCollectionsState = StateEnum.voteOnIdeaCollections;

    if (equals(boardState, createCollectionsState) ||
        equals(boardState, createIdeasAndCollectionsState)) {
      return unreadyUser(boardId, userId);
    }
    else if (equals(boardState, voteOnIdeaCollectionsState)) {
      return unfinishVoteUser(boardId, userId);
    }
  });
});
