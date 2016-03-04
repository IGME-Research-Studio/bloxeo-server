import { model as Result } from '../models/Result';
const self = {};

self.create = function(boardId, userId, ideas, round, votes) {
  return new Result({boardId: boardId, lastUpdatedId: userId,
    ideas: ideas, round: round, votes: votes}).save();
};

module.exports = self;
