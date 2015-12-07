/**
* IdeaCollections#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { isNull } from '../../../services/ValidatorService';
import { getIdeaCollections } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../services/utils';
import { RECEIVED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.RECEIVED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    return getIdeaCollections(boardId)
      .then((allCollections) => {
        stream.ok(RECEIVED_COLLECTIONS, strip(allCollections), boardId);
      })
      .catch((err) => {
        stream.serverError(RECEIVED_COLLECTIONS, err.message, socket);
      });
  }
}
