/**
* IdeaCollections#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to create
*/

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.GET_COLLECTIONS, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    BoardService.workspaceToClient(boardId)
      .then((collections) => stream.ok(EVENT_API.GET_COLLECTIONS,
                                       collections, boardId))
      .catch((err) => stream.serverError(EVENT_API.GET_COLLECTIONS,
                                        err, socket.id));
  }
}
