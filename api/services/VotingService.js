/**
* VotingSerivce
* contains logic and actions for voting, archiving collections, start and
* ending the voting state
*/

import { model as Board } from '../models/Board';
import { model as Result } from '../models/Result';
import { model as IdeaCollection } from '../models/IdeaCollection';
import IdeaCollectionService from './IdeaCollectionService';

const service = {};

/**
* Increments the voting round and removes duplicate collections
* @param {String} boardId of the board to setup voting for
* @return {Promise}
*/
service.startVoting = function(boardId) {
  // increment the voting round on the board model
  Board.findOne({boardId: boardId})
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
  return Board.findOne({boardId:boardId})
  .then((board) => board.round)
  .then((round) => {
    // send all collections to results
    IdeaCollection.find({boardId: boardId})
    .select('-_id -__v')
    .then((collections) => {
      collections.map((collection) => {
        collection.round = round;
        const r = new Result(collection);
        return r.save();
      });
    })
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
  // check ready status
};

/**
* Check if all connected users are ready to move forward
* @param {String} boardId
* @param {String} userId
* @return {Promise}
*/
service.checkReadyStatus = function(boardId, userId) {
  // pull ready list from redis
  // compare against connected users

  // if all users are ready
    // if board.state == creation - startVoting()
    // if board.state == voting - finishVoting()
};

/**
* Returns all remaming collections to vote on, if empty the user is done voting
* @param {String} boardId
* @param {String} userId
* @return {Array} remaining collections to vote on for a user
*/
service.getVoteList = function(boardId, userId) {
  // pull from redis the users remaining collections to vote on
    // if key does not exist, then the user hasn't started voting yet
      // create and populate a list of all collections for the user, return it

    // if the list is empty, the user has finished voting
      // setUserReady()
      // inform the client

  // return the list
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
      collection.vote++;
      return collection.save();
    }
  })
  .then(() => {
    // remove collection from users vote list
      // fetch user's remaining collections to vote on from redis
      // remove the collection from the list and set on redis

    // if it was the last collection for them to vote on
      // setUserReady()
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
    results.map((r) => rounds[r.round].push(r));

    return rounds;
  })
};

module.exports = service;
