/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.token to authenticate the user
*/

import { isNull } from '../../../services/ValidatorService';
import { createIdeasAndIdeaCollections } from '../../../services/StateService';
import { ENABLED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function enableIdeaCreation(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(ENABLED_IDEAS, {}, socket);
  }

  return createIdeasAndIdeaCollections(boardId, true, userToken)
    .then((state) => {
      return stream.ok(ENABLED_IDEAS, {boardId: boardId, state: state},
                       boardId);
    })
    .catch((err) => {
      return stream.serverError(ENABLED_IDEAS, err.message, socket);
    });
}
