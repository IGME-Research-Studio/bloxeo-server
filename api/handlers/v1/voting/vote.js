/**
* Voting#vote
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { curry, __, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { vote as incrementVote } from '../../../services/VotingService';
import { VOTED } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function vote(req) {
  const { socket, boardId, key, increment, userToken } = req;
  const incrementVotesForThis =
    curry(incrementVote)(boardId, __, key, increment);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(userToken) || isNil(key) || isNil(increment)) {
    return stream.badRequest(VOTED, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(incrementVotesForThis)
    .then(() => {
      return stream.ok(VOTED, {}, boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(VOTED, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(VOTED, err.message, socket);
    });
}
