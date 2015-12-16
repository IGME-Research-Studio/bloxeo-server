/**
* Voting#results
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { isNull } from '../../../services/ValidatorService';
import { getResults } from '../../../services/VotingService';
import { RECEIVED_RESULTS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function results(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(RECEIVED_RESULTS, {}, socket);
  }

  return getResults(boardId)
    .then((res) => {
      return stream.ok(RECEIVED_RESULTS, res, boardId);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_RESULTS, err.message, socket);
    });
}
