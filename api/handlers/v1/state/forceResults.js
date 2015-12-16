/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.token to authenticate the user
*/

import { isNull } from '../../../services/ValidatorService';
import { createIdeaCollections } from '../../../services/StateService';
import { FORCED_RESULTS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function forceResults(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(FORCED_RESULTS, {}, socket);
  }

  return createIdeaCollections(boardId, true, userToken)
    .then((state) => {
      return stream.ok(FORCED_RESULTS, {boardId: boardId, state: state},
                       boardId);
    })
    .catch((err) => {
      return stream.serverError(FORCED_RESULTS, err.message, socket);
    });
}
