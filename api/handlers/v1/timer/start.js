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
import { STARTED_TIMER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function start(req) {
  const { socket, boardId, timerLengthInMS, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(timerLengthInMS) || isNull(userToken)) {
    return stream.badRequest(STARTED_TIMER, {}, socket);
  }

  return startTimer(boardId, timerLengthInMS)
    .then((eventId) => {
      return stream.ok(STARTED_TIMER, {boardId: boardId, eventId: eventId},
                       boardId);
    })
    .catch((err) => {
      return stream.serverError(STARTED_TIMER, err.message, socket);
    });
}
