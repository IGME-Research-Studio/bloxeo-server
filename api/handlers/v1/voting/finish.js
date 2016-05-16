/**
* Voting#finish
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { setUserReadyToFinishVoting } from '../../../services/VotingService';
import { FINISHED_USER } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../eventStream';

export default function finish(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const setUserFinishHere = partial(setUserReadyToFinishVoting, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(FINISHED_USER, required, socket);
  }

  return verifyAndGetId(userToken)
  .then(setUserFinishHere)
  .then(() => {
    return stream.ok(FINISHED_USER, {}, boardId);
  })
  .catch(JsonWebTokenError, (err) => {
    return stream.unauthorized(FINISHED_USER, err.message, socket);
  })
  .catch((err) => {
    stream.serverError(FINISHED_USER, err.message, socket);
    throw err;
  });
}
