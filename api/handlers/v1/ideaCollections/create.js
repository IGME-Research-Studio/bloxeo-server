/**
* IdeaCollections#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to initialize the
* collection with.
*/

import { isNull } from '../../../services/ValidatorService';
import { create as createCollection, getAllIdeas } from '../../../services/IdeaCollectionService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = req.content;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(content)) {
    stream.badRequest(EXT_EVENTS.CREATE_COLLECTION, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    createCollection(boardId, content)
      .then((collectionIndex) => {
        return [getAllIdeas(boardId, collectionIndex), collectionIndex];
      })
      .spread((ideaStrings, collectionIndex) => {
        // Inform all clients a new collection has been added to the board
        stream.ok(EXT_EVENTS.ADDED_COLLECTION,
                  {index: collectionIndex, content: ideaStrings}, boardId);
      })
      .catch((err) => {
        stream.serverError(EXT_EVENTS.ADDED_COLLECTION, err, socket);
      });

  }
}
