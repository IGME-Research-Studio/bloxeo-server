/**
* Ideas#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
*/

import R from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { destroy } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../services/utils';
import { UPDATED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function remove(req) {
  const { socket, boardId, content, userToken } = req;
  const destroyThisIdeaBy = R.partialRight(destroy, [boardId, content]);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId)) {
    return stream.badRequest(UPDATED_IDEAS, {}, socket,
      'Not all required parameters were supplied');
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
