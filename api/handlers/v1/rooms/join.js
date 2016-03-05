/**
* Rooms#join
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
* @param {string} req.userToken
*/

import { curry, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { NotFoundError, ValidationError } from '../../../helpers/extendable-error';
import { anyAreNil } from '../../../helpers/utils';
import { addUser } from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { JOINED_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function join(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const addThisUser = curry(addUser)(boardId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(JOINED_ROOM, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(addThisUser)
    .then(([__, userId]) => {
      return stream.join({socket, boardId, userId});
    })
    .catch(NotFoundError, (err) => {
      return stream.notFound(JOINED_ROOM, err.data, socket, err.message);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(JOINED_ROOM, err.data, socket, err.message);
    })
    .catch(ValidationError, (err) => {
      return stream.serverError(JOINED_ROOM, err.data, socket, err.message);
    })
    .catch((err) => {
      return stream.serverError(JOINED_ROOM, err.message, socket);
    });
}
