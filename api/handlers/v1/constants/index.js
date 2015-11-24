/**
* ConstantsController
*/

import constantsService from '../../../services/ConstantsService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const socket = req.socket;

  stream.emitTo({event: EXT_EVENTS.RECEIVED_CONSTANTS,
                 code: 200,
                 socket: socket,
                 res: constantsService()});
}
