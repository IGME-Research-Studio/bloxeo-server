/**
* Rooms#update
*
*
*/

import { partial, isNil } from 'ramda';
import { UPDATED_BOARD } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';
import { errorIfNotAdmin } from '../../../services/BoardService';
import { findBoard } from '../../../services/BoardService';
import { update as updateBoard } from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UnauthorizedError } from '../../../helpers/extendable-error';
import { strip } from '../../../helpers/utils';

export default function update(req) {
  const { socket, boardId, userToken, attribute, value } = req;
  const errorIfNotAdminOnThisBoard = partial(errorIfNotAdmin, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNil(boardId) || isNil(userToken)) {
    return stream.badRequest(UPDATED_BOARD, {}, socket);
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
