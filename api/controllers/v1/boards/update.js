/**
* BoardController#update
* @description :: server-side logic for updating boards
*/

import boardService from '../../../services/BoardService';
import { isNull } from '../../../services/ValidatorService';

export default function update(req, res) {
  const boardId = req.param('boardId');
  const name = req.body.name;
  const description = req.body.description;

  if (isNull(boardId) || isNull(name) || isNull(description)) {
    return res.badRequest(
      { message: 'Not all required parameters were supplied'});
  }

  boardService.update(boardId, name, description)
    .then(() => res.ok({boardId: boardId}))
    .catch((err) => res.serverError(err));
}
