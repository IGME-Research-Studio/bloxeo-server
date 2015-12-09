/**
* Rooms#leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
*/

import { isNull } from '../../../services/ValidatorService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function leave(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket)) {
    return false;
  }
  // if do things that will ask Will 
  // user stuff
  if (isNull(boardId)) {
    return stream.badRequest(EXT_EVENTS.LEFT_ROOM, {}, socket,
      'Not all required parameters were supplied');
  }

  // BoardService.leave with boardId and userId
  stream.leave(socket, boardId);
  stream.ok(EXT_EVENTS.LEFT_ROOM, {}, boardId,
     `User with socket id ${socket.id} left board ${boardId}`);

}
