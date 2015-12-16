/**
* Voting#ready
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNull } from '../../../services/ValidatorService';
import { setUserReady } from '../../../services/VotingService';
import { READIED_USER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function ready(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(READIED_USER, {}, socket);
  }

  return setUserReady(boardId, userToken)
    .then(() => {
      return stream.ok(READIED_USER, {}, boardId);
    })
    .catch((err) => {
      return stream.serverError(READIED_USER, err.message, socket);
    });
}
