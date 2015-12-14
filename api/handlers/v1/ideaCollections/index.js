/**
* IdeaCollections#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
*/

import { JsonWebTokenError } from 'jsonwebtoken';
import { isNull } from '../../../services/ValidatorService';
import { verifyAndGetId } from '../../../services/TokenService';
import { getIdeaCollections } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip } from '../../../services/utils';
import { RECEIVED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../event-stream';

export default function index(req) {
  const { socket, boardId, userToken } = req;
  const getCollections = () => getIdeaCollections(boardId);

  if (isNull(socket)) {
    return new Error('Undefined request socket in handler');
  }

  if (isNull(boardId) || isNull(userToken)) {
    stream.badRequest(RECEIVED_COLLECTIONS, {}, socket,
      'Not all required parameters were supplied');
  }

  return verifyAndGetId(userToken)
    .then(getCollections)
    .then((allCollections) => {
      return stream.okTo(RECEIVED_COLLECTIONS, strip(allCollections), socket);
    })
    .catch(JsonWebTokenError, (err) => {
      return stream.unauthorized(RECEIVED_COLLECTIONS, err.message, socket);
    })
    .catch((err) => {
      return stream.serverError(RECEIVED_COLLECTIONS, err.message, socket);
    });
}
