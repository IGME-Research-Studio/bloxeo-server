/**
* TimerService#startTimer
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import { startTimer } from '../../../services/TimerService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function startTimerCountdown(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const timerLengthInMilliseconds = req.timerLengthInMilliseconds;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(timerLengthInMilliseconds)) {
    stream.badRequest(EXT_EVENTS.STARTED_TIMER, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    // @todo pass user along
    startTimer(boardId, timerLengthInMilliseconds)
      .then((eventId) => stream.OK(EXT_EVENTS.START_TIMER, {eventId}, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.START_TIMER,
                                         err.message, socket));
  }
}
