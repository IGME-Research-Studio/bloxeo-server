/**
* IdeaCollections#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.key key of the collection
*/

import { isNull } from '../../../services/ValidatorService';
import { destroyByKey as removeCollection } from '../../../services/IdeaCollectionService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function destroy(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const key = req.key;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(key)) {
    stream.badRequest(EXT_EVENTS.UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    removeCollection(boardId, key)
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATED_COLLECTIONS,
                                         err.message, socket));
  }
}
