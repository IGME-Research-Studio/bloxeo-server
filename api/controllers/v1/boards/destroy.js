/**
 * BoardController#destroy
 *
 * @description :: Server-side logic for destroying boards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import boardService from '../../../services/BoardService';
import valid from '../../../services/ValidatorService';

export default function destroy(req, res) {
  const boardId = req.param('boardId');

  if (valid.isNull(boardId)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  boardService.destroy(boardId)
    .then(() => res.ok({boardId: boardId}))
    .catch((err) => res.serverError(err));
}
