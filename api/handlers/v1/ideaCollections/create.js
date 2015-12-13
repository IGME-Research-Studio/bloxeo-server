/**
* IdeaCollections#create
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.content the content of the idea to initialize the
* collection with.
*/

import _ from 'lodash';
import { isNull } from '../../../services/ValidatorService';
import { create as createCollection } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../services/utils';
import { UPDATED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function create(req) {
  const socket = req.socket;
  const boardId = req.boardId;
  const content = req.content;
  const top = req.top;
  const left = req.left;
  const userToken = req.userToken;

  if (isNull(socket)) {
    throw new Error('Undefined request socket in handler');
  }
  else if (isNull(boardId) || isNull(content)) {
    stream.badRequest(UPDATED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }
  else {
    // @TODO pass user along
    return createCollection(null, boardId, content)
      .then(([created, allCollections]) => {
        stream.ok(UPDATED_COLLECTIONS,
                  _.merge({key: created.key, top: top, left: left},
                          strip(allCollections)),
                  boardId);
      })
      .catch((err) => {
        stream.serverError(UPDATED_COLLECTIONS, err.message, socket);
      });
  }
}
