import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import INT_EVENTS from '../../../constants/INT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = req.content;

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId) || isNull(content)) {
    stream.badRequest(EXT_EVENTS.JOINED_ROOM, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    IdeaService.create(content, boardId)
      .then(function(created) {
        // add the idea to the board
        return BoardService.addIdea(boardId, created.id);
      })
      .then(function() {
        // find and populate all ideas
        return BoardService.findBoardAndPopulate(boardId, 'ideas');
      })
      .then(function(board) {
        // extract idea content
        const allIdeas = BoardService.ideasToClient(board);

        // emit the idea back through the socket and
        stream.created(EXT_EVENTS.UPDATED_IDEAS, allIdeas, boardId);
      })
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATED_IDEAS, err, boardId));
  }
}
