/**
 * BoardController#create
 *
 */

// import boardService from '../../../services/BoardService';
import stream from '../../../event-stream';
import valid from '../../../services/ValidatorService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';

export default function create(req, res) {
  const isPublic = req.body.isPublic;

  if (valid.isNull(isPublic)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  // stream.emit('broadcast', {boardId: 'boardId',
  //                event: 'broadcast',
  //                body: 'User joined',})

  return res.created({message: 'created'});

  // boardService.create(req.body)
  //   .then((created) => res.created(created.boardId))
  //   .catch((err) => res.serverError(err));
}
