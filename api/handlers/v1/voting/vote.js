/**
* Voting#vote
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { curry, __, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { vote as incrementVote } from '../../../services/VotingService';
import { VOTED } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../eventStream';

export default function vote(req) {
  const { socket, boardId, key, increment, userToken } = req;
  const required = { boardId, key, increment, userToken };

  const incrementVotesForThis =
    curry(incrementVote)(boardId, __, key, increment);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(VOTED, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(incrementVotesForThis)
    .then(() => {
      return stream.okTo(VOTED, {}, socket);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(VOTED, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(VOTED, err.message, socket);
    });
}
