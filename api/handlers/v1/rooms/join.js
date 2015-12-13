/**
* Rooms#join
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import R from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import BoardService from '../../../services/BoardService';
import { JOINED_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function join(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(JOINED_ROOM, {}, socket,
      'Not all required parameters were supplied');
  }

  return BoardService.exists(boardId)
    .then((exists) => {
      if (exists) {
        stream.join(socket, boardId);
        stream.ok(JOINED_ROOM, {}, boardId,
           `User with socket id ${socket.id} joined board ${boardId}`);
      }
      else {
        stream.notFound(JOINED_ROOM, {}, socket, 'Board not found');
      }
    });
}
