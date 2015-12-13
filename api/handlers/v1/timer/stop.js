/**
* TimerService#startTimer
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import { stopTimer } from '../../../services/TimerService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function disableTimer(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const eventId = req.eventId;
  const token = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(eventId) || isNull(token)) {
    stream.badRequest(EXT_EVENTS.DISABLED_TIMER, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    // @todo pass user along
    stopTimer(boardId, eventId)
      .then((success) => stream.ok(EXT_EVENTS.DISABLED_TIMER, {boardId: boardId, disabled: success}, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.DISABLED_TIMER,
                                         err.message, socket));
  }
}
