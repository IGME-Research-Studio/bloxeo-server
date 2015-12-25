/**
 * KeyValService
 * A light wrapper around ioredis to encode our key/val store business logic
 *
 * The 'Schema', i.e. what we're storing and under which key
 *
 *  // State
 *  `${boardId}-state`: { createIdeaCollectione,
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
 * Use these as the only keys to set in redis
 */
const stateKey = (boardId) => `${boardId}-state`;
const votingCollectionsKey = (boardId, userId) => `${boardId}-voting-${userId}`;
const votingReadyKey = (boardId) => `${boardId}-voting-ready`;
const votingDoneKey = (boardId) => `${boardId}-voting-done`;
const currentUsersKey = (boardId) => `${boardId}-current-users`;

const maybeThrowIfNoOp = (numberOfOperations) => {
  if (numberOfOperations <= 0) throw new NoOpError('Redis call did nothing');
  return numberOfOperations
};

/**
 * Change a user's status in a room in redis
 * Curried for easy partial application
 * @example
 *  changeUser('add')(BOARDID, USERID)
 *  changeUser(R.__, BOARDID, USERID)('remove')
 * @param {'add'|'remove'} operation
 * @param {String} boardId
 * @param {String} userId
 * @returns {Promise<Integer|NoOpError|Error>}
 */
self.changeUser = R.curry((operation, boardId, userId) => {
  let method;

  if (operation.toLowerCase() === 'add') method = 'sadd';
  else if (operation.toLowerCase() === 'remove') method = 'srem';
  else throw new Error(`Invalid operation ${operation}`);

  return Redis[method](currentUsersKey(boardId), userId)
    .then(maybeThrowIfNoOp);
});

self.removeUser = self.changeUser('remove');
self.addUser = self.changeUser('add');

/**
 * Get all the users currently connected to the room
 * @param {String} boardId
 * @returns {Promise<Array|Error>} resolves to an array of userIds
 */
self.getUsers = (boardId) => {
  return Redis.smembers(currentUsersKey(boardId));
};

export default self;
