/**
* Ideas#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
* @param {string} req.userToken
*/

import { partialRight, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { destroy } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../helpers/utils';
import { UPDATED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function remove(req) {
  const { socket, boardId, content, userToken } = req;
  const destroyThisIdeaBy = partialRight(destroy, [boardId, content]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNil(boardId) || isNil(userToken)) {
    return stream.badRequest(UPDATED_IDEAS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(destroyThisIdeaBy)
    .then((allIdeas) => {
      return stream.ok(UPDATED_IDEAS, strip(allIdeas), boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(UPDATED_IDEAS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(UPDATED_IDEAS, err.message, socket);
    });
}
