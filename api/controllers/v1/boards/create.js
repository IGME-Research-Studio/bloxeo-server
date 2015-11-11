/**
 * BoardController#create
 *
 * @description :: Server-side logic for creating boards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import BoardService from '../../../services/BoardService';
import valid from '../../../services/ValidatorService';
import EVENT_API from '../../../constants/EVENT_API';

export default function create(req, res) {
  if (valid.isNull(req.body)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  BoardService.create(req.body)
  .then(function(created) {

    return res.created(created.boardId);
  })
  .catch(function(err) {

    return res.serverError(err);
  });
};
