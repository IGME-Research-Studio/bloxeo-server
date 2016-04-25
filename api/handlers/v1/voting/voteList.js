/**
* Voting#getVoteList
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getVoteList } from '../../../services/VotingService';
import { stripNestedMap as strip, anyAreNil } from '../../../helpers/utils';
import { RECEIVED_VOTING_ITEMS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function voteList(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const getThisVoteList = partial(getVoteList, [boardId]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_VOTING_ITEMS, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(getThisVoteList)
    .then((collections) => {
      return stream.ok(RECEIVED_VOTING_ITEMS, strip(collections), boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_VOTING_ITEMS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_VOTING_ITEMS, err.message, socket);
    });
}
