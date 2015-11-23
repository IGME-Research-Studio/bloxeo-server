/**
* Ideas#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { isNull } from '../../../services/ValidatorService';
import { getIdeas } from '../../../services/IdeaService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const boardId = req.boardId;
  const socket = req.socket;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.RECEIVED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    getIdeas(boardId)
      .then((ideas) => stream.ok(EXT_EVENTS.RECEIVED_IDEAS, ideas, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.RECEIVED_IDEAS,
                                         err.message, socket));
  }
}
