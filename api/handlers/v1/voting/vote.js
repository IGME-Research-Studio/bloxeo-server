/**
* Voting#vote
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userId
*/

import { isNull } from '../../../services/ValidatorService';
import { vote as incrementVote } from '../../../services/VotingService';
import { VOTED } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function vote(req) {
  const { socket, boardId, key, increment, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken) || isNull(key) || isNull(increment)) {
    return stream.badRequest(VOTED, {}, socket);
  }

  return incrementVote(boardId, userToken, key, increment)
    .then(() => {
      return stream.ok(VOTED, {}, boardId);
    })
    .catch((err) => {
      return stream.serverError(VOTED, err.message, socket);
    });
}
