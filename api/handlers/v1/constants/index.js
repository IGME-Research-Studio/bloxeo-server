/**
* ConstantsController
*/

import constantsService from '../../../services/ConstantsService';
import { RECEIVED_CONSTANTS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const {socket} = req;

  return stream.emitTo({event: RECEIVED_CONSTANTS,
                 code: 200,
                 socket: socket,
                 res: constantsService()});
}
