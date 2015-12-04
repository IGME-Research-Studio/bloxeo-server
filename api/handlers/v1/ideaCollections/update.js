/**
* IdeaCollections#update
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea update
*/

import _ from 'lodash';
import { isNull } from '../../../services/ValidatorService';
import { updateIdeaCollection as updateCollection } from '../../../services/IdeaCollectionService';
import EXT_EVENTS from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = _.pick(req.body, 'votes');

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(content)) {
    stream.badRequest(EXT_EVENTS.UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    updateCollection(boardId, key, content, true)
      .then((res) => stream.ok(EXT_EVENTS.UPDATED_COLLECTIONS,
                               _.merge({top: top, left: left}, res), boardId))
      .catch((err) => stream.serverError(EXT_EVENTS.UPDATED_COLLECTIONS,
                                         err.message, socket));
  }
}
