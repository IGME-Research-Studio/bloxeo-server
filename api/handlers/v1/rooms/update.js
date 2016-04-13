/**
* Rooms#update
*/

import { isNil, values } from 'ramda';
import Promise from 'bluebird';

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
  const { socket, boardId, userToken, updates } = req;
  const required = { boardId, userToken, updates };

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(UPDATED_BOARD, required, socket);
  }

  return Promise.all([
    findBoard(boardId),
    verifyAndGetId(userToken),
  ])
  .spread(errorIfNotAdmin)
  .then(([board /* , userId */]) => updateBoard(board, updates))
  .then((updatedBoard) => {
    return stream.ok(UPDATED_BOARD, strip(updatedBoard), boardId);
  })
  .catch(JsonWebTokenError, UnauthorizedError, (err) => {
    stream.unauthorized(UPDATED_BOARD, err.message, socket);
    throw err;
  })
  .catch((err) => {
    stream.serverError(UPDATED_BOARD, err.message, socket);
    throw err;
  });
}
