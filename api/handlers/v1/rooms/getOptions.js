/**
* Rooms#getUsers
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import { isNil, values } from 'ramda';
import { getBoardOptions } from '../../../services/BoardService';
import { NotFoundError } from '../../../helpers/extendable-error';
import { anyAreNil } from '../../../helpers/utils';
import { RECEIVED_OPTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function getOptions(req) {
  const { socket, boardId } = req;
  const required = { boardId };

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_OPTIONS, required, socket);
  }

  return getBoardOptions(boardId)
    .then((options) => {
      return stream.okTo(RECEIVED_OPTIONS, options, socket);
    })
    .catch(NotFoundError, (err) => {
      return stream.notFound(RECEIVED_OPTIONS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_OPTIONS, err.message, socket);
    });
}
