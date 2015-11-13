/**
 * BoardController#create
 *
 * @description :: Server-side logic for creating boards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// import _ from 'lodash';

// import boardService from '../../../services/BoardService';
// import EVENT_API from '../../../constants/EVENT_API';
import valid from '../../../services/ValidatorService';

export default function create(req, res) {
  const isPublic = req.body.isPublic;

  if (valid.isNull(isPublic)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  return res.created({message: 'created'});

  // boardService.create(req.body)
  //   .then((created) => res.created(created.boardId))
  //   .catch((err) => res.serverError(err));
}
