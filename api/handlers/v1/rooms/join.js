/**
* Rooms#join
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
* @param {string} req.userToken
*/

import { JsonWebTokenError } from 'jsonwebtoken';
import { NotFoundError, ValidationError } from '../../../helpers/extendable-error';
import { isNull } from '../../../services/ValidatorService';
import { addUser} from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { JOINED_ROOM } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function join(req) {
  const { socket, boardId, userToken } = req;
  const addThisUser = R.curry(addUser)(boardId);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(JOINED_ROOM, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(addThisUser)
    .then(() => {
      return stream.join(socket, boardId);
    })
    .catch(NotFoundError, (err) => {
      return stream.notFound(JOINED_ROOM, err.message, socket);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(JOINED_ROOM, err.message, socket);
    })
    .catch(ValidationError, (err) => {
      return stream.serverError(JOINED_ROOM, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(JOINED_ROOM, err.message, socket);
    });
}
