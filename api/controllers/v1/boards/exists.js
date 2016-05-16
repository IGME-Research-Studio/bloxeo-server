/**
 * BoardController#exists
 *
 * Checks if a board exists through an HTTP request.
 */

import { values } from 'ramda';
import { exists as doesBoardExist } from '../../../services/BoardService';
import { anyAreNil } from '../../../helpers/utils';

export default function exists(req, res) {
  const { boardId } = req.body;
  const required = { boardId };

  if (anyAreNil(values(required))) {
    return res.badRequest({ ...required,
      message: 'Not all required parameters were supplied'});
  }

  return doesBoardExist(boardId)
    .then((boardExists) => res.ok({exists: boardExists}))
    .catch((err) => res.serverError(err));
}
