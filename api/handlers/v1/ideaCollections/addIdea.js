/**
* IdeaCollections#addIdea
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.key key of the collection
*/

import { isNull } from '../../../services/ValidatorService';
import { addIdea as addIdeaToCollection  } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../services/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function addIdea(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = req.content;
  const key = req.key;
  const userToken = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(content) || isNull(key)) {
    stream.badRequest(UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    return addIdeaToCollection(boardId, key, content)
      .then((allCollections) => {
        stream.ok(UPDATED_COLLECTIONS, strip(allCollections), boardId);
      })
      .catch((err) => {
        stream.serverError(UPDATED_COLLECTIONS, err.message, socket);
      });
  }
}
