/**
 * AuthController#validate
 *
 * Validates a given token, returns the Mongo user object
 */

import { isNil } from 'ramda';
import { verify } from '../../../services/TokenService';
import { JsonWebTokenError } from 'jsonwebtoken';

export default function validate(req, res) {
  const userToken = req.body.userToken;

  if (isNil(userToken)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  return verify(userToken)
    .then((user) => {
      return res.ok({user: user, message: 'Valid userToken'});
    })
    .catch(JsonWebTokenError, (err) => {
      return res.unauthorized({error: err, message: 'Invalid userToken'});
    })
    .catch((err) => {
      return res.internalServerError(
        {error: err, message: 'Something went wrong on ther server'});
    });
}
