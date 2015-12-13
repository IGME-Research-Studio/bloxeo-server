/**
* Rooms#join
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function join(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket)) {
    return false;
  }
  // if do things that will ask Will
  // user stuff
  if (isNull(boardId)) {
    return stream.badRequest(EXT_EVENTS.JOINED_ROOM, {}, socket,
      'Not all required parameters were supplied');
  }

  BoardService.exists(boardId)
  .then((exists) => {
    if (exists) {
      stream.join(socket, boardId);
      // Boardservice.join with boardId and userId
      stream.ok(EXT_EVENTS.JOINED_ROOM, {}, boardId,
         `User with socket id ${socket.id} joined board ${boardId}`);
    }
    else {
      stream.notFound(EXT_EVENTS.JOINED_ROOM, {}, socket,
        'Board not found');
    }
  });
}
