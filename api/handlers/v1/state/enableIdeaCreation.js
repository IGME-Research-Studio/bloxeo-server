/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import R from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { createIdeasAndIdeaCollections } from '../../../services/StateService';
import { ENABLED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function enableIdeaCreation(req) {
  const { socket, boardId, userToken } = req;
  const setState = R.partial(createIdeasAndIdeaCollections, [boardId, true]);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(ENABLED_IDEAS, {}, socket);
  }

  return verifyAndGetId(userToken)
    .then(setState)
    .then((state) => {
      return stream.ok(ENABLED_IDEAS, {boardId: boardId, state: state},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(ENABLED_IDEAS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(ENABLED_IDEAS, err.message, socket);
    });
}
