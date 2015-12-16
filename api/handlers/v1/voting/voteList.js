/**
* Voting#getVoteList
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNull } from '../../../services/ValidatorService';
import { getVoteList } from '../../../services/VotingService';
import { RECEIVED_VOTING_ITEMS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function voteList(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(RECEIVED_VOTING_ITEMS, {}, socket);
  }

  return getVoteList(boardId, userToken)
    .then((collections) => {
      return stream.ok(RECEIVED_VOTING_ITEMS, collections, boardId);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_VOTING_ITEMS, err.message, socket);
    });
}
