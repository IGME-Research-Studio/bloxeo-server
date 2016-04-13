/**
* ConstantsController
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
*/

import { isNil } from 'ramda';
import constantsService from '../../../services/ConstantsService';
import { RECEIVED_CONSTANTS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const { socket } = req;

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }

  return stream.emitTo({event: RECEIVED_CONSTANTS,
                 code: 200,
                 socket: socket,
                 res: constantsService()});
}
