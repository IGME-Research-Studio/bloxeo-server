/**
 * BoardController#create
 *
 */

import boardService from '../../../services/BoardService';
import valid from '../../../services/ValidatorService';

export default function create(req, res) {
  const isPublic = req.body.isPublic;

  if (valid.isNull(isPublic)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  boardService.create(req.body)
    .then((created) => res.created(created.boardId))
    .catch((err) => res.serverError(err));
}
