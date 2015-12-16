/**
* Voting#ready
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userId
*/

import { isNull } from '../../../services/ValidatorService';
import { setUserReady } from '../../../services/VotingService';
import { READIED_USER } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function ready(req) {
  const { socket, boardId, userToken } = req;
  var userId = userToken;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(userId)) {
    stream.badRequest(EXT_EVENTS.READIED_USER, {}, socket,
      'Not all required parameters were supplied');
  }

  return setUserReady(boardId, userId)
    .then(() => {
      return stream.ok(READIED_USER, {}, boardId);
    })
    .catch((err) => {
      return stream.serverError(READIED_USER, err.message, socket);
    });
}
