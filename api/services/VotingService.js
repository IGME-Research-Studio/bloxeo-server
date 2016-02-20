/**
* VotingSerivce
*
* contains logic and actions for voting, archiving collections, start and
* ending the voting state
*/

import { model as Board } from '../models/Board';
import { model as Result } from '../models/Result';
import { model as IdeaCollection } from '../models/IdeaCollection';
import Redis from '../helpers/key-val-store';
import Promise from 'bluebird';
import InMemory from './KeyValService';
import _ from 'lodash';
import R from 'ramda';
import IdeaCollectionService from './IdeaCollectionService';
import BoardService from './BoardService';
import StateService from './StateService';
import stream from '../event-stream';
import EXT_EVENTS from '../constants/EXT_EVENT_API';

const self = {};

/**
* Increments the voting round and removes duplicate collections
* @param {String} boardId: id of the board to setup voting for
* @param {Boolean} requiresAdmin: whether or not action requires admin
* @param {String} userToken: the encrypted token containing a user id
* @return {Promise<>}
* @TODO Possible future optimization: Use promise.all after findOneAndUpdate
* @TODO Incorporate state changes after initial voting functionality works
*/
self.startVoting = function(boardId, requiresAdmin, userToken) {
  // increment the voting round on the board model
  return Board.findOneAndUpdate({boardId: boardId}, {$inc: { round: 1 }})
  // remove duplicate collections
  .then(() => IdeaCollectionService.removeDuplicates(boardId))
  .then(() => InMemory.clearVotingReady(boardId))
  .then(() => StateService.voteOnIdeaCollections(boardId, requiresAdmin, userToken));
};

/**
* Handles transferring the collections that were voted on into results
* @param {String} boardId of the baord to finish voting for
* @return {Promise}
*/
self.finishVoting = function(boardId) {
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
self.setUserReady = function(boardId, userId) {
  // in redis push UserId into ready list
  return InMemory.readyUser(boardId, userId)
  // return Redis.sadd(boardId + '-ready', userId)
  .then(() => self.isRoomReady(boardId));
};

/**
* Check if all connected users are ready to move forward
* @param {String} boardId
* @return {Promise}
*/
self.isRoomReady = function(boardId) {
  return BoardService.getConnectedUsers(boardId)
  .then((users) => {
    if (users.length === 0) {
      throw new Error('No users in the room');
    }
    else {
      return users.map((u) => {
        return self.isUserReady(boardId, u)
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
          return self.startVoting(boardId)
          .then(() => StateService.voteOnIdeaCollections(boardId, false, null))
          .then((state) => {
            stream.ok(EXT_EVENTS.READY_TO_VOTE, {boardId: boardId, state: state}, boardId);
            return true;
          });
        }
        else if (_.isEqual(currentState, StateService.StateEnum.voteOnIdeaCollections)) {
          return self.finishVoting(boardId)
          .then(() => StateService.createIdeaCollections(boardId, false, null))
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
};

/**
* Check if a connected user is ready to move forward
* @param {String} boardId
* @param {String} userId
* @return {Promise}
*/
self.isUserReady = function(boardId, userId) {
  InMemory.isUserReady(boardId, userId);
};

/**
* Returns all remaining collections to vote on, if empty the user is done voting
* @param {String} boardId
* @param {String} userId
* @return {Array} remaining collections to vote on for a user
*/
self.getVoteList = function(boardId, userId) {
  return Redis.exists(boardId + '-voting-' + userId)
  .then((exists) => {
    if (exists === 0) {
      // check if the user is ready (done with voting)
      return self.isUserReady(boardId, userId)
      .then((ready) => {
        if (ready) {
          return [];
        }
        else {
          return IdeaCollectionService.getIdeaCollections(boardId)
          .then((collections) => {
            Redis.sadd(`${boardId}-voting-${userId}`,
                       _.map(collections, (v, k) => k));
            return collections;
          });
        }
      });
    }
    else {
      // pull from redis the user's remaining collections to vote on
      return Redis.smembers(boardId + '-voting-' + userId)
      .then((keys) => {
        // @XXX no tests never hit this and I'm pretty sure the following fails
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
self.vote = function(boardId, userId, key, increment) {
  // find collection
  return IdeaCollection.findOne({boardId: boardId, key: key})
  .then((collection) => {
    // increment the vote if needed
    if (increment === true) {
      collection.votes++;
      collection.save(); // save async, don't hold up client
    }

    return Redis.srem(boardId + '-voting-' + userId, key)
    .then(() => Redis.exists(boardId + '-voting-' +  userId))
    .then((exists) => {
      if (exists === 0) {
        return self.setUserReady(boardId, userId);
      }
      return true;
    });
  });
};

/**
* Rounds are sorted newest -> oldest
* @param {String} boardId to fetch results for
* @returns {Promise} nested array containing all rounds of voting
*/
self.getResults = function(boardId) {
  // fetch all results for the board
  return Result.findOnBoard(boardId)
    .then((results) => R.groupBy(R.prop('round'))(results));
};

module.exports = self;
