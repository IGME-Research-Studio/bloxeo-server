/**
* Ideas#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const boardId = req.boardId;
  const socket = req.socket;

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.GET_IDEAS, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    BoardService.getIdeas(boardId)
      .then((ideas) => stream.ok(EXT_EVENTS.GET_IDEAS, ideas, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.GET_IDEAS, err, boardId));
  }
}
