/**
* Ideas#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import R from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { getIdeas } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../services/utils';
import { RECEIVED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const { socket, boardId } = req;
  const getTheseIdeas = R.partialRight(getIdeas, [boardId]);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(RECEIVED_IDEAS, {}, socket,
      'Not all required parameters were supplied');
  }

  return verifyAndGetId(userToken)
    .then(getTheseIdeas)
    .then((allIdeas) => {
      return stream.okTo(RECEIVED_IDEAS, strip(allIdeas), socket);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_IDEAS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_IDEAS, err.message, socket);
    });
}
