/**
* Ideas#destroy
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to remove
*/

import { isNull } from '../../../services/ValidatorService';
import { destroy } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../services/utils';
import { UPDATED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function remove(req) {
  const boardId = req.boardId;
  const socket = req.socket;
  const content = req.content;
  const userToken = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(UPDATED_IDEAS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    return destroy(boardId, content)
      .then((allIdeas) => {
        stream.ok(UPDATED_IDEAS, strip(allIdeas), boardId);
      })
      .catch((err) => {
        stream.serverError(UPDATED_IDEAS, err.message, socket);
      });
  }
}
