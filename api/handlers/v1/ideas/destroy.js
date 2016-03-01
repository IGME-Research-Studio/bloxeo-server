/**
* Ideas#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
* @param {string} req.userToken
*/

import { curry, isNil, __ } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { destroy } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../helpers/utils';
import { UPDATED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';
import Promise from 'bluebird';

export default function remove(req) {
  const { socket, boardId, content, userToken } = req;
  const destroyThisIdeaBy = curry(destroy, __, __, content);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(userToken)) {
    return stream.badRequest(UPDATED_IDEAS, {}, socket);
  }

  return Promise.all([
    Board.findOne({boardId: boardId}),
    verifyAndGetId(userToken),
  ])
  .spread(destroyThisIdeaBy)
  .then((allIdeas) => {
    return [getIdeaCollections(boardId), allIdeas];
  })
  .then(([ideaCollections, allIdeas]) => {
    return Promise.all([
      stream.ok(UPDATED_IDEAS, strip(allIdeas), boardId),
      stream.ok(UPDATED_COLLECTIONS, strip(ideaCollections), boardId),
    ]);
  })
  .catch(JsonWebTokenError, (err) => {
    return stream.unauthorized(UPDATED_IDEAS, err.message, socket);
  })
  .catch((err) => {
    return stream.serverError(UPDATED_IDEAS, err.message, socket);
  });
}
