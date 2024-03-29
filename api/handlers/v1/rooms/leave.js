/**
* Rooms#leave
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to leave
* @param {string} req.userToken
*/

import { isNil, values } from 'ramda';
import { handleLeavingUser } from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { anyAreNil } from '../../../helpers/utils';
import { LEFT_ROOM } from '../../../constants/EXT_EVENT_API';
import { EmptyBoardError } from '../../../helpers/extendable-error';
import { createIdeasAndIdeaCollections } from '../../../services/StateService';
import stream from '../../../eventStream';

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
    .then((userId) => handleLeavingUser(userId, socket.id))
    .then(({userId}) => {
      return stream.leave({socket, boardId, userId});
    })
    .catch(EmptyBoardError, (err) => {
      // If the last person leaves the board, transition to default state
      createIdeasAndIdeaCollections(boardId, false, userToken);
      return stream.serverError(LEFT_ROOM, err.message, socket);
    })
    .catch((err) => {
      stream.serverError(LEFT_ROOM, err.message, socket);
      throw err;
    });
}
