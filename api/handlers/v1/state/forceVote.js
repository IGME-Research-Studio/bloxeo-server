/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { partial, isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { voteOnIdeaCollections } from '../../../services/StateService';
import { FORCED_VOTE } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../event-stream';

export default function forceVote(req) {
  const { socket, boardid, usertoken } = req;
  const required = { boardid, usertoken };

  const setState = partial(voteOnIdeaCollections, [boardId, true]);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(FORCED_VOTE, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(setState)
    .then((state) => {
      return stream.ok(FORCED_VOTE, {boardId: boardId, state: state}, boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(FORCED_VOTE, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(FORCED_VOTE, err.message, socket);
    });
}
