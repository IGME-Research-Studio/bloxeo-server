/**
* IdeaCollections#removeIdea
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.key key of the collection
* @param {string} req.userToken
*/

import { partialRight, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { removeIdea as removeIdeaFromCollection } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../helpers/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function removeIdea(req) {
  const { socket, boardId, content, key, userToken } = req;
  const removeThisIdeaBy = partialRight(removeIdeaFromCollection,
                                        [boardId, key, content]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNil(boardId) || isNil(content) || isNil(key) || isNil(userToken)) {
    return stream.badRequest(UPDATED_COLLECTIONS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(removeThisIdeaBy)
    .then((allCollections) => {
      return stream.ok(UPDATED_COLLECTIONS, strip(allCollections), boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(UPDATED_COLLECTIONS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(UPDATED_COLLECTIONS, err.message, socket);
    });
}
