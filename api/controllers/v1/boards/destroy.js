/**
 * BoardController#destroy
 *
 * @description :: Server-side logic for destroying boards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import BoardService from '../../../services/BoardService';
import valid from '../../../services/ValidatorService';
import EVENT_API from '../../../constants/EVENT_API';

export default function destroy(req, res) {
  const boardId = req.param('boardId');

  if (valid.isNull(boardId)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  BoardService.destroy(boardId)
  .then(function(deleted) {

    return res.ok(deleted);
  })
  .catch(function(err) {

    return res.serverError(err);
  });
};
