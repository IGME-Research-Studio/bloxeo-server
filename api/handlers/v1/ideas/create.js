/**
* Ideas#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.userToken
*/

import { partialRight, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { InvalidDuplicateError } from '../../../helpers/extendable-error';
import { verifyAndGetId } from '../../../services/TokenService';
import { create as createIdea, getIdeas} from '../../../services/IdeaService';
import { stripMap as strip, anyAreNil } from '../../../helpers/utils';
import { UPDATED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function create(req) {
  const { socket, boardId, content, userToken } = req;
  const required = { boardId, content, userToken };

  const createThisIdeaBy = partialRight(createIdea, [boardId, content]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(UPDATED_IDEAS, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(createThisIdeaBy)
    .then(allIdeas => {
      return stream.created(UPDATED_IDEAS, strip(allIdeas), boardId);
    })
    .catch(InvalidDuplicateError, err => {
      return getIdeas(boardId)
      .then(allIdeas => {
        return stream.ok(UPDATED_IDEAS, strip(allIdeas), boardId, err.message);
      });
    })
    .catch(JsonWebTokenError, err => {
      return stream.unauthorized(UPDATED_IDEAS, err.message, socket);
    })
    .catch(err => {
      return stream.serverError(UPDATED_IDEAS, err.message, socket);
    });
}
