/**
* VotingSerivce
*
* contains logic and actions for voting, archiving collections, start and
* ending the voting state
*/

import Promise from 'bluebird';
import _ from 'lodash';
import { equals, groupBy, prop } from 'ramda';

import { UnauthorizedError } from '../helpers/extendable-error';
import { model as Board } from '../models/Board';
import { model as Result } from '../models/Result';
import { model as IdeaCollection } from '../models/IdeaCollection';
import { getCollectionsToVoteOn, getUsersReadyToVote, getUsersDoneVoting,
  clearVotingReady, clearVotingDone, getUsersInRoom, addToUserVotingList,
  checkUserVotingListExists, readyUserToVote, readyUserDoneVoting,
  clearUserVotingList, removeFromUserVotingList } from './KeyValService';
import { destroy as destroyCollection,
  removeDuplicates, getIdeaCollections } from './IdeaCollectionService';
import { createResult } from './ResultService';
import {createIdeaCollections, getState, StateEnum,
   voteOnIdeaCollections} from './StateService';

const maybeIncrementCollectionVote = function(query, update, increment) {
  if (increment) {
    return IdeaCollection.findOneAndUpdate(query, update);
  }
  else {
    return Promise.resolve(false);
  }
};

/**
* Checks to see if a collection was already voted on by a user
* @param {String} boardId
* @param {String} userId
* @param {String} key: collection key to check
* @param {Promise<Boolean|Error>}
*/
export const wasCollectionVotedOn = function(boardId, userId, key) {
  return getCollectionsToVoteOn(boardId, userId)
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
export const getResults = function(boardId) {
  // fetch all results for the board
  return Result.findOnBoard(boardId)
    .then((results) => groupBy(prop('round'))(results));
};

/**
* Checks if the user is ready to move forward based on the voting action
* @param {String} votingAction: voting action to check for ('start' or 'finish')
* @param {String} boardId: the id of the board
* @param {String} userId: the user id of the user to check
* @returns {Promise<Boolean|Error>}: returns if the user is ready to proceed
*/
export const isUserReady = function(votingAction, boardId, userId) {
  let method;

  if (votingAction.toLowerCase() === 'start') method = getUsersReadyToVote;
  else if (votingAction.toLowerCase() === 'finish') method = getUsersDoneVoting;
  else throw new Error(`Invald votingAction ${votingAction}`);

  return method(boardId)
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
export const isUserReadyToVote = function(boardId, userId) {
  return isUserReady('start', boardId, userId);
};

/**
* Check if a connected user is done voting
* @param {String} boardId: board id to get the users done voting
* @param {String} userId: user id to check if done voting
* @return {Promise<Boolean|Error>}: returns if the user is done voting or not
*/
export const isUserDoneVoting = function(boardId, userId) {
  return isUserReady('finish', boardId, userId);
};

/**
* Increments the voting round and removes duplicate collections
* @param {String} boardId: id of the board to setup voting for
* @param {Boolean} requiresAdmin: whether or not action requires admin
* @param {String} userToken: the encrypted token containing a user id
* @return {Promise<>}
* @TODO Possible future optimization: Use promise.all after findOneAndUpdate
*/
export const startVoting = function(boardId, requiresAdmin, userToken) {
  // increment the voting round on the board model
  return Board.findOneAndUpdate({boardId: boardId}, {$inc: { round: 1 }})
  // remove duplicate collections
  .then(() => removeDuplicates(boardId))
  .then(() => clearVotingReady(boardId))
  .then(() => voteOnIdeaCollections(boardId, requiresAdmin, userToken));
};

/**
* @TODO: Bring back the top # results to the board as new idea collections
* Handles transferring the collections that were voted on into results
* @param {String} boardId of the baord to finish voting for
* @return {Promise}
*/
export const finishVoting = function(boardId, requiresAdmin, userToken) {
  return Board.findOne({boardId: boardId})
  .then((board) => {
    // send all collections to results
    return IdeaCollection.find({boardId: boardId})
    .then((collections) => {
      return collections.map((collection) => {
        return Promise.all([
          createResult(boardId, collection.lastUpdatedId,
             collection.ideas, board.round, collection.votes),
          destroyCollection(boardId, collection),
        ]);
      });
    });
  })
  .then(() => clearVotingDone(boardId))
  .then(() => createIdeaCollections(boardId, requiresAdmin, userToken));
};

/**
* Calls startVoting with admin permission to force the board to start voting
* @param {String} boardId: board id of the current board
* @param {String} userToken: token containing encrypted user id
* @returns {Promise<Object|Error>: returns the state of the board}
*/
export const forceStartVoting = function(boardId, userToken) {
  return startVoting(boardId, true, userToken);
};

/**
* Calls finishVoting with admin permission to force the board to finish voting
* @param {String} boardId: board id of the current board
* @param {String} userToken: token containing encrypted user id
* @returns {Promise<Object|Error>: returns the state of the board}
*/
export const forceFinishVoting = function(boardId, userToken) {
  return finishVoting(boardId, false, userToken);
};


/**
* @TODO: Split this function into smaller and less error prone functions.
* Checks if the room is ready to proceed based on voting action passed in
* Transitions the state after determining which state the board is currently in
* @param {String} votingAction: voting action to check for ('start' or 'finish')
* @param {String} boardId: id of the board
* @returns {Promise<Boolean|Error>}: returns if the room is ready to proceed
*/
export const isRoomReady = function(votingAction, boardId) {
  let method;
  let action;
  let requiredBoardState;
  let alternateBoardState;
  // Get the connected users
  return getUsersInRoom(boardId)
  .then((userIds) => {
    if (userIds.length === 0) {
      throw new Error('No users are currently connected to the room');
    }
    // Check if the users are ready to move forward based on voting action
    if (votingAction.toLowerCase() === 'start') {
      method = isUserReadyToVote;
      action = startVoting;
      requiredBoardState = StateEnum.createIdeaCollections;
      alternateBoardState = StateEnum.createIdeasAndIdeaCollections;
    }
    else if (votingAction.toLowerCase() === 'finish') {
      method = isUserDoneVoting;
      action = finishVoting;
      requiredBoardState = StateEnum.voteOnIdeaCollections;
    }
    else throw new Error(`Invalid votingAction ${votingAction}`);

    return userIds.map((userId) => {
      return method(boardId, userId)
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

    if (roomReadyToMoveForward) {
      // Transition the board state
      return getState(boardId)
      .then((state) => {
        if (equals(state, requiredBoardState) ||
            equals(state, alternateBoardState)) {
          return action(boardId, false, '');
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

export const getVoteList = function(boardId, userId) {
  // Check if the user has a redis key for collections to vote on that exists
  return checkUserVotingListExists(boardId, userId)
  .then((exists) => {
    if (!exists) {
      // Check if the user is done voting in case of refresh or disconnect
      return isUserDoneVoting(boardId, userId)
      .then((ready) => {
        if (ready) {
          return [];
        }
        else {
          // User has not voted on any collections yet so get all collections
          return getIdeaCollections(boardId)
          .then((collections) => {
            const collectionKeys = _.map(collections, function(collection) {
              return collection.key;
            });
            // Stick the collection keys into redis and associate with the user
            return Promise.all([
              addToUserVotingList(boardId, userId, collectionKeys),
              Promise.resolve(collections),
            ]);
          })
          .then(([/* collectionKeys */, collections]) => {
            return collections;
          });
        }
      });
    }
    else {
      // @TODO: do i want to only send the array of keys or populate each one and strip?
      // Get remaining collections to vote on from the collection keys in Redis
      return getCollectionsToVoteOn(boardId, userId)
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
* Mark a user as ready to progress
* Used for both readying up for voting, and when done voting
* @param {String} votingAction: voting action to check for ('start' or 'finish')
* @param {String} boardId: id for the board
* @param {String} userId: id for the user to ready
* @return {Promise<Boolean|Error>}: returns if the room is ready to progress
*/
export const setUserReady = function(votingAction, boardId, userId) {
  let method;

  if (votingAction.toLowerCase() === 'start') method = readyUserToVote;
  else if (votingAction.toLowerCase() === 'finish') {
    method = readyUserDoneVoting;
  }
  else throw new Error(`Invalid voting action ${votingAction}`);
  // in Redis, push UserId into appropriate ready list
  return method(boardId, userId)
  .then(() => isRoomReady(votingAction, boardId));
};

/**
* Sets the user ready to vote
* @param {String} boardId: id of the board
* @param {String} userId: id of the user
* @returns {Promise<Boolean|Error>}: returns if the room is ready to vote
*/
export const setUserReadyToVote = function(boardId, userId) {
  // Clear the user's voting list if it still exists (from forced state transition)
  return checkUserVotingListExists(boardId, userId)
  .then((exists) => {
    if (exists) {
      return clearUserVotingList(boardId, userId);
    }
    else {
      return false;
    }
  })
  .then(() => isUserReadyToVote(boardId))
  .then((readyToVote) => {
    if (readyToVote) {
      throw new UnauthorizedError('User is already ready to vote.');
    }
    return setUserReady('start', boardId, userId);
  });
};

/**
* Sets the user ready to finish voting
* @param {String} boardId: id of the board
* @param {String} userId: id of the user
* @returns {Promise<Boolean|Error>}: returns if the room is done voting
*/
export const setUserReadyToFinishVoting = function(boardId, userId) {
  return isUserDoneVoting(boardId, userId)
  .then((doneVoting) => {
    if (doneVoting) {
      throw new UnauthorizedError('User is already ready to finish voting');
    }

    return setUserReady('finish', boardId, userId);
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
export const vote = function(boardId, userId, key, increment) {
  const query = {boardId: boardId, key: key};
  const updatedData = {$inc: { votes: 1 }};

  return wasCollectionVotedOn(boardId, userId, key)
  .then(() => {
    return maybeIncrementCollectionVote(query, updatedData, increment);
  })
  .then(() => removeFromUserVotingList(boardId, userId, key))
  .then(() => getCollectionsToVoteOn(boardId, userId))
  .then((collections) => {
    if (collections.length === 0) {
      return setUserReadyToFinishVoting(boardId, userId);
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
export const isRoomReadyToVote = function(boardId) {
  return isRoomReady('start', boardId);
};

/**
* Checks to see if the room is ready to finish voting
* Should be called every time a user is done voting or leaves the room
* @param {String} boardId: board id of the board to check
* @returns {Promise<Boolean|Error>}: returns if the room is finished voting
*/
export const isRoomDoneVoting = function(boardId) {
  return isRoomReady('finish', boardId);
};
