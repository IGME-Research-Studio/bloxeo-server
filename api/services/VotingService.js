/**
* VotingSerivce
*
* contains logic and actions for voting, archiving collections, start and
* ending the voting state
*/

import { model as Board } from '../models/Board';
import { model as Result } from '../models/Result';
import { model as IdeaCollection } from '../models/IdeaCollection';
import Promise from 'bluebird';
import InMemory from './KeyValService';
import _ from 'lodash';
import log from 'winston';
import { groupBy, prop } from 'ramda';
import { UnauthorizedError } from '../helpers/extendable-error';
import IdeaCollectionService from './IdeaCollectionService';
import ResultService from './ResultService';
import StateService from './StateService';

const self = {};

const maybeIncrementCollectionVote = function(query, update, increment) {
  if (increment) {
    return IdeaCollection.findOneAndUpdate(query, update);
  }
  else {
    return Promise.resolve(false);
  }
};

/**
* Increments the voting round and removes duplicate collections
* @param {String} boardId: id of the board to setup voting for
* @param {Boolean} requiresAdmin: whether or not action requires admin
* @param {String} userToken: the encrypted token containing a user id
* @return {Promise<>}
* @TODO Possible future optimization: Use promise.all after findOneAndUpdate
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
* @TODO: Bring back the top # results to the board as new idea collections
* Handles transferring the collections that were voted on into results
* @param {String} boardId of the baord to finish voting for
* @return {Promise}
*/
self.finishVoting = function(boardId, requiresAdmin, userToken) {
  return Board.findOne({boardId: boardId})
  .then((board) => {
    // send all collections to results
    return IdeaCollection.find({boardId: boardId})
    .then((collections) => {
      return collections.map((collection) => {
        return Promise.all([
          ResultService.create(boardId, collection.lastUpdatedId,
             collection.ideas, board.round, collection.votes),
          IdeaCollectionService.destroy(boardId, collection),
        ]);
      });
    });
  })
  .then(() => InMemory.clearVotingDone(boardId))
  .then(() => StateService.createIdeaCollections(boardId, requiresAdmin, userToken));
};

/**
* Calls startVoting with admin permission to force the board to start voting
* @param {String} boardId: board id of the current board
* @param {String} userToken: token containing encrypted user id
* @returns {Promise<Object|Error>: returns the state of the board}
*/
self.forceStartVoting = function(boardId, userToken) {
  return self.startVoting(boardId, true, userToken);
};

/**
* Calls finishVoting with admin permission to force the board to finish voting
* @param {String} boardId: board id of the current board
* @param {String} userToken: token containing encrypted user id
* @returns {Promise<Object|Error>: returns the state of the board}
*/
self.forceFinishVoting = function(boardId, userToken) {
  return self.finishVoting(boardId, false, userToken);
};

/**
* Mark a user as ready to progress
* Used for both readying up for voting, and when done voting
* @param {String} votingAction: voting action to check for ('start' or 'finish')
* @param {String} boardId: id for the board
* @param {String} userId: id for the user to ready
* @return {Promise<Boolean|Error>}: returns if the room is ready to progress
*/
self.setUserReady = function(votingAction, boardId, userId) {
  let method;

  if (votingAction.toLowerCase() === 'start') method = 'readyUserToVote';
  else if (votingAction.toLowerCase() === 'finish') {
    method = 'readyUserDoneVoting';
  }
  else throw new Error(`Invalid voting action ${votingAction}`);
  // in Redis, push UserId into appropriate ready list
  return InMemory[method](boardId, userId)
  .then(() => self.isRoomReady(votingAction, boardId));
};

/**
* Sets the user ready to vote
* @param {String} boardId: id of the board
* @param {String} userId: id of the user
* @returns {Promise<Boolean|Error>}: returns if the room is ready to vote
*/
self.setUserReadyToVote = function(boardId, userId) {
  // Clear the user's voting list if it still exists (from forced state transition)
  return InMemory.checkUserVotingListExists(boardId, userId)
  .then((exists) => {
    if (exists) {
      return InMemory.clearUserVotingList(boardId, userId);
    }
    else {
      return false;
    }
  })
  .then(() => self.isUserReadyToVote(boardId))
  .then((readyToVote) => {
    if (readyToVote) {
      throw new UnauthorizedError('User is already ready to vote.');
    }

    return self.setUserReady('start', boardId, userId);
  });
};

/**
* Sets the user ready to finish voting
* @param {String} boardId: id of the board
* @param {String} userId: id of the user
* @returns {Promise<Boolean|Error>}: returns if the room is done voting
*/
self.setUserReadyToFinishVoting = function(boardId, userId) {
  return self.isUserDoneVoting(boardId, userId)
  .then((doneVoting) => {
    if (doneVoting) {
      throw new UnauthorizedError('User is already ready to finish voting');
    }

    return self.setUserReady('finish', boardId, userId);
  });
};

/**
* Checks if the room is ready to proceed based on voting action passed in
* @param {String} votingAction: voting action to check for ('start' or 'finish')
* @param {String} boardId: id of the board
* @returns {Promise<Boolean|Error>}: returns if the room is ready to proceed
*/
self.isRoomReady = function(votingAction, boardId) {
  let method;
  let action;
  let requiredBoardState;
  // Get the connected users
  return InMemory.getUsersInRoom(boardId)
  .then((userIds) => {
    if (userIds.length === 0) {
      // throw new Error('No users are currently connected to the room');
      log.info(`No users are currently connected to room ${boardId}.`);
      return [];
    }
    // Check if the users are ready to move forward based on voting action
    if (votingAction.toLowerCase() === 'start') {
      method = 'isUserReadyToVote';
      action = 'startVoting';
      requiredBoardState = StateService.StateEnum.createIdeaCollections;
    }
    else if (votingAction.toLowerCase() === 'finish') {
      method = 'isUserDoneVoting';
      action = 'finishVoting';
      requiredBoardState = StateService.StateEnum.voteOnIdeaCollections;
    }
    else throw new Error(`Invalid votingAction ${votingAction}`);

    return userIds.map((userId) => {
      return self[method](boardId, userId)
      .then((isReady) => {
        return {ready: isReady};
      });
    });
  })
  .then((promises) => {
    if (promises.length === 0) {
      return [];
    }

    return Promise.all(promises);
  })
  // Check if all the users are ready to move forward
  .then((userStates) => {
    let roomReadyToMoveForward;

    if (userStates.length === 0) roomReadyToMoveForward = false;
    else roomReadyToMoveForward = _.every(userStates, {'ready': true});
    console.log(roomReadyToMoveForward); 

    if (roomReadyToMoveForward) {
      // Transition the board state
      return StateService.getState(boardId)
      .then((state) => {
        if (_.isEqual(state, requiredBoardState)) {
          return self[action](boardId, false, '');
        }
        else {
          throw new Error('Current board state does not allow for readying');
        }
      })
      .then(() => true);
    }
    else {
      return false;
    }
  });
};

/**
* Checks to see if the room is ready to vote
* Should be called every time a user is ready to vote or leaves the room
* @param {String} boardId: board id of the board to check
* @returns {Promise<Boolean|Error>}: returns if the room is ready to vote or not
*/
self.isRoomReadyToVote = function(boardId) {
  return self.isRoomReady('start', boardId);
};

/**
* Checks to see if the room is ready to finish voting
* Should be called every time a user is done voting or leaves the room
* @param {String} boardId: board id of the board to check
* @returns {Promise<Boolean|Error>}: returns if the room is finished voting
*/
self.isRoomDoneVoting = function(boardId) {
  return self.isRoomReady('finish', boardId);
};

/**
* Checks if the user is ready to move forward based on the voting action
* @param {String} votingAction: voting action to check for ('start' or 'finish')
* @param {String} boardId: the id of the board
* @param {String} userId: the user id of the user to check
* @returns {Promise<Boolean|Error>}: returns if the user is ready to proceed
*/
self.isUserReady = function(votingAction, boardId, userId) {
  let method;

  if (votingAction.toLowerCase() === 'start') method = 'getUsersReadyToVote';
  else if (votingAction.toLowerCase() === 'finish') method = 'getUsersDoneVoting';
  else throw new Error(`Invald votingAction ${votingAction}`);

  return InMemory[method](boardId)
  .then((userIds) => {
    if (userIds.indexOf(userId) > -1) {
      return true;
    }
    else {
      return false;
    }
  });
};

/**
* Check if a connected user is ready to vote
* @param {String} boardId: board id to get the users ready to vote
* @param {String} userId: user id to check if ready to vote
* @return {Promise<Boolean|Error>}: returns if the user is ready to vote or not
*/
self.isUserReadyToVote = function(boardId, userId) {
  return self.isUserReady('start', boardId, userId);
};

/**
* Check if a connected user is done voting
* @param {String} boardId: board id to get the users done voting
* @param {String} userId: user id to check if done voting
* @return {Promise<Boolean|Error>}: returns if the user is done voting or not
*/
self.isUserDoneVoting = function(boardId, userId) {
  return self.isUserReady('finish', boardId, userId);
};

self.getVoteList = function(boardId, userId) {
  // Check if the user has a redis key for collections to vote on that exists
  return InMemory.checkUserVotingListExists(boardId, userId)
  .then((exists) => {
    if (!exists) {
      // Check if the user is done voting in case of refresh or disconnect
      return self.isUserDoneVoting(boardId, userId)
      .then((ready) => {
        if (ready) {
          return [];
        }
        else {
          // User has not voted on any collections yet so get all collections
          return IdeaCollectionService.getIdeaCollections(boardId)
          .then((collections) => {
            const collectionKeys = _.map(collections, function(collection) {
              return collection.key;
            });
            // Stick the collection keys into redis and associate with the user
            return InMemory.addToUserVotingList(boardId, userId, collectionKeys);
          });
        }
      });
    }
    else {
      // Get remaining collections to vote on from the collection keys in Redis
      return InMemory.getCollectionsToVoteOn(boardId, userId)
      .then((collectionKeys) => {
        return _.map(collectionKeys, function(collectionKey) {
          return IdeaCollection.findByKey(boardId, collectionKey);
        });
      })
      .then((promises) => {
        return Promise.all(promises);
      });
    }
  });
};

/**
* Requires that the board is in the voting state
* Find the specific collection and increment its votes or remove it from the
* user's voting list in Redis
* @param {String} boardId
* @param {String} userId
* @param {String} key of collection to vote for
* @param {Boolean} wether to increment the vote for the collection
* @return {Promise<Array|String|Error>} the key or array of keys voted on
*/
self.vote = function(boardId, userId, key, increment) {
  const query = {boardId: boardId, key: key};
  const updatedData = {$inc: { votes: 1 }};

  // @TODO: Add a new stub for this function to finish test and push to github
  return self.wasCollectionVotedOn(boardId, userId, key)
  .then(() => {
    return maybeIncrementCollectionVote(query, updatedData, increment);
  })
  .then(() => InMemory.removeFromUserVotingList(boardId, userId, key))
  .then(() => InMemory.getCollectionsToVoteOn(boardId, userId))
  .then((collections) => {
    if (collections.length === 0) {
      return self.setUserReadyToFinishVoting(boardId, userId);
    }
    else {
      return false;
    }
  });
};

/**
* Checks to see if a collection was already voted on by a user
* @param {String} boardId
* @param {String} userId
* @param {String} key: collection key to check
* @param {Promise<Boolean|Error>}
*/
self.wasCollectionVotedOn = function(boardId, userId, key) {
  return InMemory.getCollectionsToVoteOn(boardId, userId)
  .then((collections) => {
    if (collections.indexOf(key) === -1) {
      throw new UnauthorizedError('Collection was already voted on or does not exist');
    }
    else {
      return false;
    }
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
    .then((results) => groupBy(prop('round'))(results));
};

module.exports = self;
