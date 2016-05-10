/**
* IdeaCollections#index
*
* @param {Object} req
* @param {Object} req.socket the connecting socket object
* @param {string} req.boardId
* @param {string} req.userToken
*/

import { isNil, values } from 'ramda';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyAndGetId } from '../../../services/TokenService';
import { getIdeaCollections } from '../../../services/IdeaCollectionService';
import { stripNestedMap as strip, anyAreNil } from '../../../helpers/utils';
import { RECEIVED_COLLECTIONS } from '../../../constants/EXT_EVENT_API';
import stream from '../../../eventStream';

export default function index(req) {
  const { socket, boardId, userToken } = req;
  const required = { boardId, userToken };

  const getCollections = () => getIdeaCollections(boardId);

  if (isNil(socket)) {
    return new Error('Undefined request socket in handler');
  }
  if (anyAreNil(values(required))) {
    return stream.badRequest(RECEIVED_COLLECTIONS, required, socket);
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
