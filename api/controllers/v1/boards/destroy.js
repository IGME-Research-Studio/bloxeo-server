/**
 * BoardController#destroy
 *
 * @description :: Server-side logic for destroying boards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import { values } from 'ramda';
import boardService from '../../../services/BoardService';
import { anyAreNil } from '../../../helpers/utils';

export default function destroy(req, res) {
  const { boardId } = req.body;
  const required = { boardId };

  if (anyAreNil(values(required))) {
    return res.badRequest({ ...required,
      message: 'Not all required parameters were supplied'});
  }

  return boardService.destroy(boardId)
    .then(() => res.ok({boardId: boardId}))
    .catch((err) => res.serverError(err));
}
