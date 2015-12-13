/**
* IdeaCollections#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.key key of the collection
*/

import { isNull } from '../../../services/ValidatorService';
import { destroy as removeCollection } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../services/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function destroy(req) {
  const { socket, boardId, key, userToken } = req;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(key)) {
    stream.badRequest(UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    return removeCollection(boardId, key)
      .then((allCollections) => {
        stream.ok(UPDATED_COLLECTIONS, strip(allCollections), boardId);
      })
      .catch((err) => {
        stream.serverError(UPDATED_COLLECTIONS, err.message, socket);
      });
  }
}
