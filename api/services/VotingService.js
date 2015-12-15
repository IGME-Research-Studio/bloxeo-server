/**
* VotingSerivce
* contains logic and actions for voting, archiving collections, start and
* ending the voting state
*/

import { model as Board } from '../models/Board';
import { model as Result } from '../models/Result';
import { model as IdeaCollection } from '../models/IdeaCollection';
import Redis from './RedisService';
import Promise from 'bluebird';
import _ from 'lodash';
import IdeaCollectionService from './IdeaCollectionService';
<<<<<<< HEAD

const service = {};
const keyPrefix = 'boardId-voting-';
=======
import BoardService from './BoardService';
import StateService from './StateService';
import stream from '../event-stream';
import EXT_EVENTS from '../constants/EXT_EVENT_API';

const service = {};
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3

/**
* Increments the voting round and removes duplicate collections
* @param {String} boardId of the board to setup voting for
* @return {Promise}
*/
service.startVoting = function(boardId) {
  // increment the voting round on the board model
  return Board.findOne({boardId: boardId})
  .then((b) => {
    b.round++;
    return b.save();
  })  // remove duplicate collections
  .then(() => IdeaCollectionService.removeDuplicates(boardId));
};

/**
* Handles transferring the collections that were voted on into results
* @param {String} boardId of the baord to finish voting for
* @return {Promise}
*/
service.finishVoting = function(boardId) {
  return Board.findOne({boardId: boardId})
  .then((board) => board.round)
  .then((round) => {
    // send all collections to results
    return IdeaCollection.find({boardId: boardId})
    .select('-_id -__v')
    .then((collections) => {
      return collections.map((collection) => {
        const r = new Result();
        r.round = round;
        r.ideas = collection.ideas;
        r.votes = collection.votes;
        r.boardId = boardId;
        return r.save();
      });
    });
  }) // Destroy old idea collections
  .then(() => IdeaCollection.remove({boardId: boardId}));
};

/**
* Mark a user as ready to progress
* Used for both readying up for voting, and when done voting
* @param {String} boardId
* @param {String} userId
* @return {Promise}
*/
service.setUserReady = function(boardId, userId) {
  // in redis push UserId into ready list
<<<<<<< HEAD
  return Redis.sadd(keyPrefix + 'ready', userId);
  // .then(() => service.isRoomReady(boardId));
=======
  return Redis.sadd(boardId + '-ready', userId)
  .then(() => service.isRoomReady(boardId));
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
};

/**
* Check if all connected users are ready to move forward
* @param {String} boardId
* @return {Promise}
*/
service.isRoomReady = function(boardId) {
<<<<<<< HEAD
  return Board.getConnectedUsers()
  .then((users) => {
    return users.map((u) => {
      return service.isUserReady(boardId, u)
      .then((isReady) => {
        return {ready: isReady};
      });
    });
  })
  .then((states) => _.every(states, 'ready', true));
=======
  return BoardService.getConnectedUsers(boardId)
  .then((users) => {
    if (users.length === 0) {
      throw new Error('No users in the room');
    }
    else {
      return users.map((u) => {
        return service.isUserReady(boardId, u)
        .then((isReady) => {
          return {ready: isReady};
        });
      });
    }
  })
  .then((promises) => {
    return Promise.all(promises);
  })
  .then((states) => {
    const roomReady = _.every(states, 'ready', true);
    if (roomReady) {
      return StateService.getState(boardId)
      .then((currentState) => {
        if (_.isEqual(currentState, StateService.StateEnum.createIdeaCollections)) {
          return StateService.voteOnIdeaCollections(boardId, false, null)
          .then((state) => {
            stream.ok(EXT_EVENTS.READY_TO_VOTE, {boardId: boardId, state: state}, boardId);
            return true;
          });
        }
        else if (_.isEqual(currentState, StateService.StateEnum.voteOnIdeaCollections)) {
          return StateService.createIdeaCollections(boardId, false, null)
          .then((state) => {
            stream.ok(EXT_EVENTS.FINISHED_VOTING, {boardId: boardId, state: state}, boardId);
            return true;
          });
        }
        else {
          throw new Error('Current state does not account for readying');
        }
      });
    }
    else {
      return false;
    }
  })
  .catch((err) => {
    throw err;
  });
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
};

/**
* Check if a connected user is ready to move forward
* @param {String} boardId
* @param {String} userId
* @return {Promise}
*/
service.isUserReady = function(boardId, userId) {
<<<<<<< HEAD
  return Redis.sismember(keyPrefix + 'ready', userId)
=======
  return Redis.sismember(boardId + '-ready', userId)
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
  .then((ready) => ready === 1);
};


/**
* Returns all remaming collections to vote on, if empty the user is done voting
* @param {String} boardId
* @param {String} userId
* @return {Array} remaining collections to vote on for a user
*/
service.getVoteList = function(boardId, userId) {
<<<<<<< HEAD
  return Redis.exists(keyPrefix + 'userId')
=======
  return Redis.exists(boardId + '-voting-' + userId)
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
  .then((exists) => {
    if (exists === 0) {
      // check if the user is ready (done with voting)
      return service.isUserReady(boardId, userId)
      .then((ready) => {
        if (ready) {
          return [];
        }
<<<<<<< HEAD

        return IdeaCollection.findOnBoard('boardId')
        .then((collections) => {
          Redis.sadd(keyPrefix + 'userId', collections.map((c) => c.key));
          return collections;
        });
=======
        else {
          return IdeaCollection.findOnBoard(boardId)
          .then((collections) => {
            Redis.sadd(boardId + '-voting-' + userId, collections.map((c) => c.key));
            return collections;
          });
        }
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
      });
    }
    else {
      // pull from redis the users remaining collections to vote on
<<<<<<< HEAD
      return Redis.smembers(keyPrefix + 'userId')
=======
      return Redis.smembers(boardId + '-voting-' + userId)
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
      .then((keys) => {
        return Promise.all(keys.map((k) => IdeaCollection.findByKey(k)));
      });
    }
  });
};

/**
* Requires that the board is in the voting state
* @param {String} boardId
* @param {String} userId
* @param {String} key of collection to vote for
* @param {bool} wether to increment the vote for the collection
* @return {bool} if the user is done voting to inform the client
*/
service.vote = function(boardId, userId, key, increment) {
  // find collection
  return IdeaCollection.findOne({boardId: boardId, key: key})
  .then((collection) => {
    // increment the vote if needed
    if (increment === true) {
<<<<<<< HEAD
      collection.vote++;
      collection.save(); // save async, don't hold up client
    }

    return Redis.srem(keyPrefix + userId, key)
    .then(() => Redis.exists(keyPrefix + userId))
=======
      collection.votes++;
      collection.save(); // save async, don't hold up client
    }

    return Redis.srem(boardId + '-voting-' + userId, key)
    .then(() => Redis.exists(boardId + '-voting-' +  userId))
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
    .then((exists) => {
      if (exists === 0) {
        return service.setUserReady(boardId, userId);
      }
<<<<<<< HEAD

      return true; // @NOTE what to return here? vote was successful
=======
      return true;
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3
    });
  });
};

/**
* Rounds are sorted newest -> oldest
* @param {String} boardId to fetch results for
* @returns {Promise} nested array containing all rounds of voting
*/
service.getResults = function(boardId) {
  // fetch all results for the board
  return Result.findOnBoard(boardId)
  .then((results) => {
    // map each round into an array
    const rounds = [];
<<<<<<< HEAD
    results.map((r) => rounds[r.round].push(r));
=======
    results.map((r) => rounds[r.round] = r);
>>>>>>> 551f48a6b3324b5bd6d8da5bf9c8ad21719acff3

    return rounds;
  });
};

module.exports = service;
