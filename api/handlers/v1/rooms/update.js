/**
* Rooms#update
*/

import { partial, isNil, values } from 'ramda';
import { UPDATED_BOARD } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';
import { errorIfNotAdmin } from '../../../services/BoardService';
import { findBoard } from '../../../services/BoardService';
import { update as updateBoard } from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UnauthorizedError } from '../../../helpers/extendable-error';
import { strip, anyAreNil } from '../../../helpers/utils';

export default function update(req) {
  const { socket, boardId, userToken, attribute, value } = req;
  const required = { boardId, userToken, attribute, value };

  const errorIfNotAdminOnThisBoard = partial(errorIfNotAdmin, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(UPDATED_BOARD, required, socket);
  }

  return Promise.All([
    findBoard(boardId),
    verifyAndGetId(userToken),
  ])
  .spread(errorIfNotAdminOnThisBoard)
  .then(() => {
    return updateBoard(board, attribute, value);
  })
  .then((updatedBoard) => {
    return stream.ok(UPDATED_BOARD, strip(updatedBoard), boardId);
  })
  .catch(JsonWebTokenError, UnauthorizedError, (err) => {
    return stream.unauthorized(UPDATED_BOARD, err.message, socket);
  })
  .catch((err) => {
    return stream.serverError(UPDATED_BOARD, err.message, socket);
  });
}
