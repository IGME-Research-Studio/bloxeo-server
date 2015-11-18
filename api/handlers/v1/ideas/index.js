import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import INT_EVENTS from '../../../constants/INT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const boardId = req.param('boardId');

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.JOINED_ROOM, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    BoardService.getIdeas(boardId)
      .then((ideas) => stream.ok(EXT_EVENTS.IDEAS, ideas, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.IDEAS, err, boardId));
  }
}
