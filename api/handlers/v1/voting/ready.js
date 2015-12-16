/**
* Voting#ready
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userId
*/

import { isNull } from '../../../services/ValidatorService';
import { setUserReady } from '../../../services/VotingService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function addIdea(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const userId = req.userId;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId), isNull(userId)) {
    stream.badRequest(EXT_EVENTS.READIED_USER, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    setUserReady(boardId, userId)
      .then(() => stream.ok(EXT_EVENTS.READIED_USER,
                                      {}, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.READIED_USER,
                                        err.message, socket));
  }
}
