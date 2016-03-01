/**
 * BoardController#create
 *
 */

import { isNil } from 'ramda';
import BoardService from '../../../services/BoardService';
import { verifyAndGetId } from '../../../services/TokenService';

export default function create(req, res) {
  const { userToken, name, description } = req;

  if (isNil(userToken) || isNil(name) || isNil(description)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  return verifyAndGetId(userToken)
  .then((userId) => {
    BoardService.create(userId, name, description)
      .then((boardId) => res.created({boardId: boardId}))
      .catch((err) => res.serverError(err));
  });
}
