/**
* TimerService#startTimer
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
import { startTimer } from '../../../services/TimerService';
import { errorIfNotAdmin } from '../../../services/BoardService';
import { STARTED_TIMER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function start(req) {
  const { socket, boardId, timerLengthInMS, userToken } = req;
  const startThisTimer = partial(startTimer, [boardId, timerLengthInMS]);
  const errorIfNotAdminOnThisBoard = partial(errorIfNotAdmin, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(timerLengthInMS) || isNil(userToken)) {
    return stream.badRequest(STARTED_TIMER, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(errorIfNotAdminOnThisBoard)
    .then(startThisTimer)
    .then((timerId) => {
      return stream.ok(STARTED_TIMER, {boardId: boardId, timerId: timerId},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(STARTED_TIMER, err.message, socket);
    })
    .catch(UnauthorizedError, (err) => {
      return stream.unauthorized(STARTED_TIMER, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(STARTED_TIMER, err.message, socket);
    });
}
