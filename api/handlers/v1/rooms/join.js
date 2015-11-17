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
    stream.badRequest(EXT_EVENTS.JOINED_ROOM, err,
      'Not all required parameters were supplied');
  }
  else {
    stream.join({socket: socket})
    stream.ok(boardId, EXT_EVENTS.JOINED_ROOM,
       `User with socket id ${socket.id} joined board ${boardId}`,})
  }
}
