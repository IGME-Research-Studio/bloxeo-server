/**
* Voting#results
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getResults } from '../../../services/VotingService';
import { RECEIVED_RESULTS } from '../../../constants/EXT_EVENT_API';
import { stripMap as strip, anyAreNil } from '../../../helpers/utils';
import stream from '../../../eventStream';

export default function results(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const getTheseResults = () => getResults(boardId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_RESULTS, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(getTheseResults)
    .then((allResults) => {
      return stream.ok(RECEIVED_RESULTS, strip(allResults), boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_RESULTS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_RESULTS, err.message, socket);
    });
}
