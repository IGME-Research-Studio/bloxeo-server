/**
* IdeaCollections#update
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea update
*/

import { isNull } from '../../../services/ValidatorService';
import { voteOnIdeaCollection as voteOnCollection } from '../../../services/IdeaCollectionService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function vote(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    voteOnCollection(boardId, key)
      .then((res) => stream.ok(EXT_EVENTS.UPDATED_COLLECTIONS,
                               res, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATED_COLLECTIONS,
                                         err.message, socket));
  }
}
