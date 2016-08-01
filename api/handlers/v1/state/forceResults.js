/**
* State#forceResults
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { createIdeaCollections } from '../../../services/StateService';
import { FORCED_RESULTS } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../eventStream';

export default function forceResults(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const setState = partial(createIdeaCollections, [boardId, true]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(FORCED_RESULTS, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(setState)
    .then((state) => {
      return stream.ok(FORCED_RESULTS, {boardId: boardId, state: state},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(FORCED_RESULTS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(FORCED_RESULTS, err.message, socket);
    });
}
