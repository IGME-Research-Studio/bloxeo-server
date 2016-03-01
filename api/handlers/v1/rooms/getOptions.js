/**
* Rooms#getUsers
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId the id of the room to join
*/

import { isNil } from 'ramda';
import { getBoardOptions } from '../../../services/BoardService';
import { RECEIVED_OPTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function getOptions(req) {
  const { socket, boardId } = req;

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNil(boardId)) {
    return stream.badRequest(RECEIVED_OPTIONS, {}, socket);
  }

  return getBoardOptions(boardId)
    .then((options) => {
      return stream.ok(socket, options, boardId);
    })
    .catch(NotFoundError, (err) => {
      return stream.notFound(RECEIVED_OPTIONS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_OPTIONS, err.message, socket);
    });
}
