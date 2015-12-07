/**
* IdeaCollections#removeIdea
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
* @param {string} req.key key of the collection
*/

import { isNull } from '../../../services/ValidatorService';
import { removeIdea as removeIdeaFromCollection } from '../../../services/IdeaCollectionService';
import { stripObjsAndNestedArr as strip } from '../../../services/utils';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function removeIdea(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = req.content;
  const key = req.key;
  const userToken = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(content) || isNull(key)) {
    stream.badRequest(EXT_EVENTS.UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    return removeIdeaFromCollection(boardId, key, content)
      .then((allCollections) => stream.ok(EXT_EVENTS.UPDATED_COLLECTIONS,
                                          strip(allCollections), boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATE_COLLECTIONS,
                                         err.message, socket));
  }
}
