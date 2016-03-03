/**
 * BoardController#create
 *
 */

import { isNil } from 'ramda';
import { verifyAndGetId } from '../../../services/TokenService';
import { create as createBoard } from '../../../services/BoardService';

export default function create(req, res) {
  const { userToken, name, description } = req.body;

  if (isNil(userToken)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  return verifyAndGetId(userToken)
  .then((userId) => {
    createBoard(userId, name, description)
      .then((boardId) => res.created({boardId: boardId}))
      .catch((err) => res.serverError(err));
  });
}
