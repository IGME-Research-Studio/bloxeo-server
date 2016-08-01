/**
 * BoardController#create
 *
 * Creates a board through an HTTP request. Requires a user first.
 */

import { values } from 'ramda';
import { verifyAndGetId } from '../../../services/TokenService';
import { create as createBoard } from '../../../services/BoardService';
import { anyAreNil } from '../../../helpers/utils';

export default function create(req, res) {
  const { userToken, boardName, boardDesc } = req.body;
  const required = { userToken };

  if (anyAreNil(values(required))) {
    return res.badRequest({ ...required,
      message: 'Not all required parameters were supplied'});
  }

  return verifyAndGetId(userToken)
  .then((userId) => {
    return createBoard(userId, boardName, boardDesc)
      .then((boardId) => res.created({boardId: boardId}))
      .catch((err) => res.serverError(err));
  });
}
