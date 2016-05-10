/**
* TimerService#getTimeLeft
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.userToken
*/

import { isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getTimeLeft } from '../../../services/TimerService';
import { RECEIVED_TIME } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../eventStream';

export default function getTime(req) {
  const { socket, boardId, timerId, userToken } = req;
  const required = { boardId, timerId, userToken };

  const getThisTimeLeft = () => getTimeLeft(timerId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_TIME, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(getThisTimeLeft)
    .then((timeLeft) => {
      return stream.okTo(RECEIVED_TIME, {boardId: boardId, timeLeft: timeLeft},
                         socket);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_TIME, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_TIME, err.message, socket);
    });
}
