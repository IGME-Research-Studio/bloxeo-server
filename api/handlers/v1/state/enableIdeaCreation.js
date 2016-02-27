/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { createIdeasAndIdeaCollections } from '../../../services/StateService';
import { ENABLED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function enableIdeaCreation(req) {
  const { socket, boardId, userToken } = req;
  const setState = partial(createIdeasAndIdeaCollections, [boardId, true]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(userToken)) {
    return stream.badRequest(ENABLED_IDEAS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(setState)
    .then((state) => {
      return stream.ok(ENABLED_IDEAS, {boardId: boardId, state: state},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(ENABLED_IDEAS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(ENABLED_IDEAS, err.message, socket);
    });
}
