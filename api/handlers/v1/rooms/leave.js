/**
* Rooms#leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
* @param {string} req.userToken
*/

import { isNull } from '../../../services/ValidatorService';
import { removeUser} from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { LEFT_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function leave(req) {
  const { socket, boardId, userToken } = req;
  const removeThisUser = R.curry(removeUser)(boardId);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(LEFT_ROOM, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(removeThisUser)
    .then(() => {
      return stream.leave(socket, boardId);
    })
    .catch((err) => {
      return stream.serverError(JOINED_ROOM, err.message, socket);
    });
}
