/**
* Ideas#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getIdeas } from '../../../services/IdeaService';
import { stripMap as strip, anyAreNil } from '../../../helpers/utils';
import { RECEIVED_IDEAS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function index(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const getTheseIdeas = () => getIdeas(boardId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_IDEAS, required, socket);
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
