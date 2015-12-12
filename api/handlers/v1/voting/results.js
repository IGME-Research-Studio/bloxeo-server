/**
* Voting#
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { isNull } from '../../../services/ValidatorService';
import { getResults } from '../../../services/VotingService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function addIdea(req) {
  const socket = req.socket;
  const boardId = req.boardId;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId)) {
    stream.badRequest(EXT_EVENTS.RECIEVED_RESULTS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    getResults(boardId)
      .then((results) => stream.ok(EXT_EVENTS.RECIEVED_RESULTS,
                                      results, boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.RECIEVED_RESULTS,
                                        err.message, socket));
  }
}
