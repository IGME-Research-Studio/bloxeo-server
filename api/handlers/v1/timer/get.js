/**
* TimerService#getTimeLeft
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import { getTimeLeft } from '../../../services/TimerService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function getTimeRemaining(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const token = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(token)) {
    stream.badRequest(EXT_EVENTS.RECEIVED_TIME, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    // @todo pass user along
    getTimeLeft(boardId)
      .then((timeLeft) => stream.okTo(EXT_EVENTS.RECEIVED_TIME, {boardId: boardId, timeLeft: timeLeft}, socket))
      .catch((err) => stream.serverError(EXT_EVENTS.RECEIVED_TIME,
                                         err.message, socket));
  }
}
