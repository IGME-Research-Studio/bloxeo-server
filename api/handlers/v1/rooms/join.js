/**
* Rooms#join
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import { JOINED_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';
import config from '../../../../config.js';

export default function join(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(JOINED_ROOM, {}, socket);
  }

  return BoardService.exists(boardId)
    .then((exists) => {
      if (exists) {
        const numUsers = BoardService.getUsers(boardId);

        if (numUsers < config.DEFAULT_CFG.roomLimit || numUsers === null) {
          stream.join(socket, boardId);
          stream.ok(EXT_EVENTS.JOINED_ROOM, {}, boardId,
             `User with socket id ${socket.id} joined board ${boardId}`);
        }
        else {
          stream.badRequest(EXT_EVENTS.JOINED_ROOM, {}, socket,
            'Room is full');
        }
      }
      else {
        return stream.notFound(JOINED_ROOM, 'Board not found', socket);
      }
    });
}
