/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken to authenticate the user
*/

import { isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getState } from '../../../services/StateService';
import { RECEIVED_STATE } from '../../../constants/EXT_EVENT_API';
import { anyAreNil } from '../../../helpers/utils';
import stream from '../../../event-stream';

export default function get(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const getThisState = () => getState(boardId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_STATE, required, socket);
  }

  return verifyAndGetId(userToken)
    .then(getThisState)
    .then((state) => {
      return stream.ok(RECEIVED_STATE, {boardId: boardId, state: state},
                       boardId);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_STATE, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_STATE, err.message, socket);
    });
}
