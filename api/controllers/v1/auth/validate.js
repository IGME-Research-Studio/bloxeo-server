/**
 * AuthController#validate
 *
 * Validates a given token, returns the Mongo user object
 */

import { verify } from '../../../services/tokenService';
import { JsonWebTokenError } from 'jsonwebtoken';

export default function validate(req, res) {
  const userToken = req.body.userToken;

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
