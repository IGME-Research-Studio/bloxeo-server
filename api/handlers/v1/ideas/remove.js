/**
* Ideas#remove
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
*/

import { isNull } from '../../../services/ValidatorService';
import BoardService from '../../../services/BoardService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function remove(req) {
  const boardId = req.boardId;
  const socket = req.socket;
  const content = req.content;

  if (isNull(socket)) {
    return false;
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.REMOVE_IDEA, {}, socket.id,
      'Not all required parameters were supplied');
  }
  else {
    IdeaService.delete(boardId, content)
      .then(function() {
        // find and populate all ideas
        return BoardService.findBoardAndPopulate(boardId, 'ideas');
      })
      .then(function(board) {
        // extract idea content
        const allIdeas = BoardService.ideasToClient(board);

        // emit the result
        stream.ok(EXT_EVENTS.REMOVE_IDEA, allIdeas, boardId);
      })
      .catch(function(err) {
        stream.serverError(EXT_EVENTS.REMOVE_IDEA, err, boardId);
      });
  }
}
