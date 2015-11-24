/**
 * BoardController#create
 *
 */

import boardService from '../../../services/BoardService';

export default function create(req, res) {
  boardService.create()
    .then((boardId) => res.created({boardId: boardId}))
    .catch((err) => res.serverError(err));
}
