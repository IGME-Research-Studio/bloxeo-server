/**
* Rooms#leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
* @param {string} req.userToken
*/

import { isNil, values } from 'ramda';
import { removeUser} from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { anyAreNil } from '../../../helpers/utils';
import { LEFT_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function leave(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(LEFT_ROOM, required, socket);
  }

  return verifyAndGetId(userToken)
    .then((userId) => {
      return Promise.all([
        removeUser(boardId, userId, socket.id),
        Promise.resolve(userId),
      ]);
    })
    .then(([__, userId]) => {
      return stream.leave({socket, boardId, userId});
    })
    .catch((err) => {
      return stream.serverError(LEFT_ROOM, err.message, socket);
    });
}
