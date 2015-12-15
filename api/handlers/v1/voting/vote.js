/**
* Voting#vote
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userId
*/

import { isNull } from '../../../services/ValidatorService';
import { vote } from '../../../services/VotingService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function addIdea(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const userId = req.userId;
  const key = req.key;
  const increment = req.increment;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(userId) ||
      isNull(key) || isNull(increment)) {
    stream.badRequest(EXT_EVENTS.VOTED, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    vote(boardId, userId, key, increment)
      .then(() => stream.ok(EXT_EVENTS.VOTED, {}, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.VOTED,
                                        err.message, socket));
  }
}
