/**
* Rooms#leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
*/

import R from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { LEFT_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function leave(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId)) {
    return stream.badRequest(LEFT_ROOM, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    stream.leave(socket, boardId);
    return stream.ok(LEFT_ROOM, {}, boardId,
       `User with socket id ${socket.id} left board ${boardId}`);
  }
}
