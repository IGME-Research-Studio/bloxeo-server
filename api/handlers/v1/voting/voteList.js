/**
* Voting#getVoteList
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userId
*/

import { isNull } from '../../../services/ValidatorService';
import { getVoteList } from '../../../services/VotingService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function addIdea(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const userId = req.userId;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(userId)) {
    stream.badRequest(EXT_EVENTS.RECIEVED_VOTING_ITEMS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    getVoteList(boardId, userId)
      .then((collections) => stream.ok(EXT_EVENTS.RECIEVED_VOTING_ITEMS,
                                       collections, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.RECIEVED_VOTING_ITEMS,
                                        err.message, socket));
  }
}
