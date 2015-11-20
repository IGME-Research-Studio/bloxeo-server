/**
* ConstantsController
*/

import constantsService from '../../../services/ConstantsService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const socket = req.socket;

  stream.emitTo({event: EXT_EVENTS.CONSTANTS,
                 socket: socket.id,
                 res: constantsService()});
}
