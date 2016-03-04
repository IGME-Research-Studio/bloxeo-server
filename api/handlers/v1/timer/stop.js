/**
* TimerService#stopTimer
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.userToken
*/

import { partial, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UnauthorizedError } from '../../../helpers/extendable-error';
import { verifyAndGetId } from '../../../services/TokenService';
import { stopTimer } from '../../../services/TimerService';
import { errorIfNotAdmin } from '../../../services/BoardService';
import { DISABLED_TIMER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function stop(req) {
  const { socket, boardId, timerId, userToken } = req;
  const stopThisTimer = () => stopTimer(timerId);
  const errorIfNotAdminOnThisBoard = partial(errorIfNotAdmin, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(timerId) || isNil(userToken)) {
    return stream.badRequest(DISABLED_TIMER, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(errorIfNotAdminOnThisBoard)
    .then(stopThisTimer)
    .then(() => {
      return stream.ok(DISABLED_TIMER, {boardId: boardId},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(DISABLED_TIMER, err.message, socket);
    })
    .catch(UnauthorizedError, (err) => {
      return stream.unauthorized(DISABLED_TIMER, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(DISABLED_TIMER, err.message, socket);
    });
}
