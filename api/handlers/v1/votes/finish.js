/**
* Votes#finish
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.token to authenticate the user
*/

import { isNull } from '../../../services/ValidatorService';
import { finishVoting } from '../../../services/StateService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function finish(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const token = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(token)) {
    stream.badRequest(EXT_EVENTS.FINISHED_VOTING, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    finishVoting(boardId, token)
      .then((response) => stream.ok(EXT_EVENTS.FINISHED_VOTING, response, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.FINISHED_VOTING,
                                         err.message, socket));
  }
}
