/**
 * BoardController#destroy
 *
 * @description :: Server-side logic for destroying boards
 */

import { values } from 'ramda';
import { destroy as destroyBoard } from '../../../services/BoardService';
import { anyAreNil } from '../../../helpers/utils';

export default function destroy(req, res) {
  const { boardId } = req.body;
  const required = { boardId };

  if (anyAreNil(values(required))) {
    return res.badRequest({ ...required,
      message: 'Not all required parameters were supplied'});
  }

  return destroyBoard(boardId)
    .then(() => res.ok({boardId: boardId}))
    .catch((err) => res.serverError(err));
}
