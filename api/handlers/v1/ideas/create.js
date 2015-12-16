/**
* Ideas#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.userToken
*/

import R from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { create as createIdea } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../helpers/utils';
import { UPDATED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const { socket, boardId, content, userToken } = req;
  const createThisIdeaBy = R.partialRight(createIdea, [boardId, content]);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(content) || isNull(userToken)) {
    return stream.badRequest(UPDATED_IDEAS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(createThisIdeaBy)
    .then((allIdeas) => {
      return stream.created(UPDATED_IDEAS, strip(allIdeas), boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(UPDATED_IDEAS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(UPDATED_IDEAS, err.message, socket);
    });
}
