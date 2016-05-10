/**
* Rooms#getUsers
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import { isNil, values } from 'ramda';
import { getUsers as getUsersOnBoard } from '../../../services/BoardService';
import { anyAreNil } from '../../../helpers/utils';
import { RECEIVED_USERS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function getUsers(req) {
  const { socket, boardId } = req;
  const required = { boardId };

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_USERS, required, socket);
  }

  return getUsersOnBoard(boardId)
    .then((users) => {
      return stream.ok(socket, users, boardId);
    })
    .catch(NotFoundError, (err) => {
      return stream.notFound(RECEIVED_USERS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_USERS, err.message, socket);
    });
}
