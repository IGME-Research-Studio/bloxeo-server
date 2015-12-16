/**
* Rooms#leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
*/

import { isNull } from '../../../services/ValidatorService';
import { LEFT_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function leave(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(LEFT_ROOM, {}, socket);
  }
  else {
    stream.leave(socket, boardId);
    BoardService.leave(boardId, userToken);
    return stream.ok(LEFT_ROOM, {}, boardId,
       `User with socket id ${socket.id} left board ${boardId}`);
  }
}
