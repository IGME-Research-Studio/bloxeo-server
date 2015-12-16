/**
* Voting#results
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { getResults } from '../../../services/VotingService';
import { RECEIVED_RESULTS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function results(req) {
  const { socket, boardId, userToken } = req;
  const getTheseResults = () => getResults(boardId);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(RECEIVED_RESULTS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(getTheseResults)
    .then((res) => {
      return stream.ok(RECEIVED_RESULTS, res, boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_RESULTS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_RESULTS, err.message, socket);
    });
}
