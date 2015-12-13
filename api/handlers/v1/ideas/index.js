/**
* Ideas#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { isNull } from '../../../services/ValidatorService';
import { getIdeas } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../services/utils';
import { RECEIVED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const { socket, boardId } = req;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(RECEIVED_IDEAS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    return getIdeas(boardId)
      .then((allIdeas) => {
        stream.ok(RECEIVED_IDEAS, strip(allIdeas), boardId);
      })
      .catch((err) => {
        stream.serverError(RECEIVED_IDEAS, err.message, socket);
      });
  }
}
