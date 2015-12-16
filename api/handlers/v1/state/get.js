/**
* Ideas#enable
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken to authenticate the user
*/

import { isNull } from '../../../services/ValidatorService';
import { getState } from '../../../services/StateService';
import { RECEIVED_STATE } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function get(req) {
  const { socket, boardId, userToken } = req;

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (isNull(boardId) || isNull(userToken)) {
    return stream.badRequest(RECEIVED_STATE, {}, socket);
  }

  return getState(boardId)
    .then((state) => {
      return stream.ok(RECEIVED_STATE, {boardId: boardId, state: state},
                       boardId);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_STATE, err.message, socket);
    });
}
