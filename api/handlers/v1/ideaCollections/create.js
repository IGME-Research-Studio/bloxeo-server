/**
* IdeaCollections#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = req.content;

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId) || isNull(content)) {
    stream.badRequest(EXT_EVENTS.JOINED_ROOM, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    IdeaCollectionService.create(boardId, content)
      .then(function(collectionIndex) {
        return [IdeaCollectionService.getAllIdeas(boardId, collectionIndex),
          collectionIndex];
      })
      .spread(function(ideaStrings, collectionIndex) {
        // Inform all clients a new collection has been added to the board
        stream.ok(EVENT_API.ADDED_COLLECTION,
                  {index: collectionIndex, content: ideaStrings}, boardId);
      })
      .catch(function(err) {
        stream.serverError(EVENT_API.ADDED_COLLECTION, err, socket.id);
      });

  }
}
