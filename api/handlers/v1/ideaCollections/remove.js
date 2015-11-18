/**
* IdeaCollections#removeIdea
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.index index of the collection
*/

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import INT_EVENTS from '../../../constants/INT_EVENT_API';
import stream from '../../../event-stream';

export default function remove(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const index = req.index;

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId) || isNull(index)) {
    stream.badRequest(EXT_EVENTS.REMOVED_COLLECTION, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    IdeaCollectionService.destroy(boardId, index)
      .then(function() {
        // notify all clients that a collection was removed
        stream.ok(EVENT_API.REMOVED_COLLECTION, {index: index}, boardId);
      })
      .catch(function(err) {
        stream.serverError(EVENT_API.REMOVED_COLLECTION, err, socket.id);
      });
  }
}
