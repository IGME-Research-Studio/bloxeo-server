/**
* /v1/room/leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
*/

import { isNull } from '../../../services/ValidatorService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import INT_EVENTS from '../../../constants/INT_EVENT_API';
import stream from '../../../event-stream';

export default function leave(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket) || isNull(boardId)) {
    stream.emit(INT_EVENTS.BROADCAST,
      {message: 'Not all required parameters were supplied'});
  }
  else {
    stream.emit(INT_EVENTS.LEAVE, {socket: socket})
    stream.emit(INT_EVENTS.BROADCAST,
      {boardId: boardId, event: EXT_EVENTS.LEFT_ROOM,
       body:'User with socket id ${socket.id} left board ${boardId}',})
  }
}
