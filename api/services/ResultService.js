import { model as Result } from '../models/Result';

/**
* Creates a new result in mongo
* @param {String} boardId: the board id to create the result on
* @param {String} userId: the user id to associate the result with
* @param {Array} ideas: the ideas associated with the result
* @param {Number} round: the round number the result was create on
* @param {Number} votes: the number of votes the result has
* @returns {Promise<MongooseObject>}: returns the newly created result
*/
export const createResult = function(boardId, userId, ideas, round, votes) {
  return new Result({boardId: boardId, lastUpdatedId: userId,
    ideas: ideas, round: round, votes: votes}).save();
};
