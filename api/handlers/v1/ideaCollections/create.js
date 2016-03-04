/**
* IdeaCollections#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to initialize the
* collection with.
* @param {string} req.userToken
*/

import { partialRight, merge, isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { create as createCollection } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../helpers/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const { socket, boardId, content, top, left, userToken } = req;
  const createThisCollectionBy = partialRight(createCollection,
                                                [boardId, content]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNil(boardId) || isNil(content) || isNil(userToken)) {
    return stream.badRequest(UPDATED_COLLECTIONS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(createThisCollectionBy)
    .then(([created, allCollections]) => {
      return stream.ok(UPDATED_COLLECTIONS,
                merge({key: created.key, top: top, left: left},
                        strip(allCollections)), boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(UPDATED_COLLECTIONS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(UPDATED_COLLECTIONS, err.message, socket);
    });
}
