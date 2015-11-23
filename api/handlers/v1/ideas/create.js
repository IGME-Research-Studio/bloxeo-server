/**
* Ideas#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import { create as createIdea } from '../../../services/IdeaService';
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
    stream.badRequest(EXT_EVENTS.UPDATED_IDEAS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    // @todo pass user along
    createIdea(null, boardId, content)
      .then((ideas) => stream.created(EXT_EVENTS.UPDATED_IDEAS, ideas, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATED_IDEAS,
                                         err.message, socket));
  }
}
