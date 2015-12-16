/**
* Ideas#disable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNull } from '../../../services/ValidatorService';
import { createIdeaCollections } from '../../../services/StateService';
import { DISABLED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function disableIdeaCreation(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(DISABLED_IDEAS, {}, socket);
  }

  return createIdeaCollections(boardId, true, userToken)
    .then((state) => {
      return stream.ok(DISABLED_IDEAS, {boardId: boardId, state: state},
                       boardId);
    })
    .catch((err) => {
      return stream.serverError(DISABLED_IDEAS, err.message, socket);
    });
}
