/**
* Ideas#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNil } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getIdeas } from '../../../services/IdeaService';
import { stripMap as strip } from '../../../helpers/utils';
import { RECEIVED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const { socket, boardId, userToken } = req;
  const getTheseIdeas = () => getIdeas(boardId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNil(boardId) || isNil(userToken)) {
    return stream.badRequest(RECEIVED_IDEAS, {}, socket);
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
