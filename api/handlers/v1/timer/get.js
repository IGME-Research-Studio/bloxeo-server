/**
* TimerService#getTimeLeft
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.userToken
*/

import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { getTimeLeft } from '../../../services/TimerService';
import { RECEIVED_TIME } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function getTime(req) {
  const { socket, boardId, userToken } = req;
  const getThisTimeLeft = () => getTimeLeft(boardId);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(RECEIVED_TIME, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(getThisTimeLeft)
    .then((timeLeft) => {
      return stream.ok(RECEIVED_TIME, {boardId: boardId, timeLeft: timeLeft},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_TIME, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_TIME, err.message, socket);
    });
}
