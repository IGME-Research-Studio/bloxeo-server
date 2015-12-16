/**
* TimerService#stopTimer
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import { stopTimer } from '../../../services/TimerService';
import { DISABLED_TIMER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function stop(req) {
  const { socket, boardId, eventId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(eventId) || isNull(userToken)) {
    return stream.badRequest(DISABLED_TIMER, {}, socket);
  }

  // @todo pass user along
  return stopTimer(boardId, eventId)
    .then((success) => {
      return stream.ok(DISABLED_TIMER, {boardId: boardId, disabled: success},
                       boardId);
    })
    .catch((err) => {
      return stream.serverError(DISABLED_TIMER, err.message, socket);
    });
}
