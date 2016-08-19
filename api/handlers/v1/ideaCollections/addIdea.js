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

import { partialRight, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { InvalidDuplicateError } from '../../../helpers/extendable-error';
import { verifyAndGetId } from '../../../services/TokenService';
import { addIdea as addIdeaToCollection, getIdeaCollections } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip, anyAreNil } from '../../../helpers/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function addIdea(req) {
  const { socket, boardId, content, key, userToken } = req;
  const required = { boardId, content, key, userToken };

  const addThisIdeaBy = partialRight(addIdeaToCollection,
                                     [boardId, key, content]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(UPDATED_COLLECTIONS, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(addThisIdeaBy)
    .then((allCollections) => {
      return stream.ok(UPDATED_COLLECTIONS, strip(allCollections), boardId);
    })
    .catch(InvalidDuplicateError, (err) => {
      return getIdeaCollections(boardId)
      .then(allCollections => {
        return stream.ok(UPDATED_COLLECTIONS, strip(allCollections), boardId, err.message);
      });
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(UPDATED_COLLECTIONS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(UPDATED_COLLECTIONS, err.message, socket);
    });
}
