/**
 * AuthController#validate
 *
 * Validates a given token, returns the Mongo user object
 */

import { values } from 'ramda';
import { verify } from '../../../services/TokenService';
import { JsonWebTokenError } from 'jsonwebtoken';
import { anyAreNil } from '../../../helpers/utils';

export default function validate(req, res) {
  const { userToken } = req.body;
  const required = { userToken };

  if (anyAreNil(values(required))) {
    return res.badRequest({ ...required,
      message: 'Not all required parameters were supplied'});
  }

  return verify(userToken)
    .then((user) => {
      return res.ok({user: user, message: 'Valid userToken'});
    })
    .catch(JsonWebTokenError, (err) => {
      return res.unauthorized({error: err, message: 'Invalid userToken'});
    })
    .catch((err) => {
      return res.internalServerError({error: err,
        message: 'Something went wrong on the server'});
    });
}
