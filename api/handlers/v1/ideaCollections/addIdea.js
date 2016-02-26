/**
* IdeaCollections#addIdea
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.key key of the collection
* @param {string} req.userToken
*/

import { partialRight } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { addIdea as addIdeaToCollection  } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../helpers/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function addIdea(req) {
  const { socket, boardId, content, key, userToken } = req;
  const addThisIdeaBy = partialRight(addIdeaToCollection,
                                     [boardId, key, content]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(content) || isNil(key) || isNil(userToken)) {
    return stream.badRequest(UPDATED_COLLECTIONS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(addThisIdeaBy)
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
