/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.token to authenticate the user
*/

import { isNull } from '../../../services/ValidatorService';
import { voteOnIdeaCollections } from '../../../services/StateService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function forceVote(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const token = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(token)) {
    stream.badRequest(EXT_EVENTS.FORCED_VOTE, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    voteOnIdeaCollections(boardId, true, token)
      .then((state) => stream.ok(EXT_EVENTS.FORCED_VOTE, {boardId: boardId, state: state}, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.FORCED_VOTE,
                                         err.message, socket));
  }
}
