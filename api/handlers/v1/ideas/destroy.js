/**
* Ideas#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
* @param {string} req.userToken
*/

import Promise from 'bluebird';
import { values, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';

import { verifyAndGetId } from '../../../services/TokenService';
import { destroy } from '../../../services/IdeaService';
import { getIdeaCollections } from '../../../services/IdeaCollectionService';
import { findBoard } from '../../../services/BoardService';
import { UnauthorizedError } from '../../../helpers/extendable-error';
import { stripMap, stripNestedMap, anyAreNil } from '../../../helpers/utils';
import {
  UPDATED_IDEAS,
  UPDATED_COLLECTIONS,
} from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function remove(req) {
  const { socket, boardId, content, userToken } = req;
  const required = { boardId, content, userToken };

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(UPDATED_IDEAS, required, socket);
  }

  return Promise.all([
    findBoard(boardId),
    verifyAndGetId(userToken),
  ])
  .then(([board, userId]) => destroy(board, userId, content))
  .then((allIdeas) => {
    return Promise.all([
      getIdeaCollections(boardId),
      Promise.resolve(allIdeas),
    ]);
  })
  .then(([ideaCollections, allIdeas]) => {
    return Promise.all([
      stream.ok(UPDATED_IDEAS, stripMap(allIdeas), boardId),
      stream.ok(UPDATED_COLLECTIONS,
                stripNestedMap(ideaCollections), boardId),
    ]);
  })
  .catch(JsonWebTokenError, UnauthorizedError, (err) => {
    return stream.unauthorized(UPDATED_IDEAS, err.message, socket);
  })
  .catch((err) => {
    stream.serverError(UPDATED_IDEAS, err.message, socket);
    throw err;
  });
}
