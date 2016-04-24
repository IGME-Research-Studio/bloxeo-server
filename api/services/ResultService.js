import { model as Result } from '../models/Result';

export const createResult = function(boardId, userId, ideas, round, votes) {
  return new Result({boardId: boardId, lastUpdatedId: userId,
    ideas: ideas, round: round, votes: votes}).save();
};
