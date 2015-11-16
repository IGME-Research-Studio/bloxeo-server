/**
* /v1/room/join
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import { isNull } from '../../../services/ValidatorService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import INT_EVENTS from '../../../constants/INT_EVENT_API';
import stream from '../../../event-stream';

export default function join(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket) || isNull(boardId)) {
    stream.emit(INT_EVENTS.BROADCAST,
      {code: 400, error: err,
       body: 'Not all required parameters were supplied'});
  }
  else {
    stream.emit(INT_EVENTS.JOIN, {socket: socket})
    stream.emit(INT_EVENTS.BROADCAST,
      {code: 200, boardId: boardId,
       event: EXT_EVENTS.JOINED_ROOM,
       body: `User with socket id ${socket.id} joined board ${boardId}`,})
  }
}
