/**
* Voting#ready
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { setUserReadyToVote } from '../../../services/VotingService';
import { READIED_USER } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../eventStream';

export default function ready(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const setUserReadyHere = partial(setUserReadyToVote, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(READIED_USER, required, socket);
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
      stream.serverError(READIED_USER, err.message, socket);
      throw err;
    });
}
