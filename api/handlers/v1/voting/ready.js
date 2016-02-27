/**
* Voting#ready
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { setUserReady } from '../../../services/VotingService';
import { READIED_USER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function ready(req) {
  const { socket, boardId, userToken } = req;
  const setUserReadyHere = partial(setUserReady, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(userToken)) {
    return stream.badRequest(READIED_USER, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(setUserReadyHere)
    .then(() => {
      return stream.ok(READIED_USER, {}, boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(READIED_USER, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(READIED_USER, err.message, socket);
    });
}
