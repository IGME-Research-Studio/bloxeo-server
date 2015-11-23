/**
* Ideas#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
*/

import { isNull } from '../../../services/ValidatorService';
import { destroy } from '../../../services/IdeaService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function remove(req) {
  const boardId = req.boardId;
  const socket = req.socket;
  const content = req.content;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.UPDATED_IDEAS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    destroy(boardId, content)
      .then((ideas) => stream.ok(EXT_EVENTS.UPDATED_IDEAS, ideas, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATED_IDEAS,
                                         err.message, socket));
  }
}
