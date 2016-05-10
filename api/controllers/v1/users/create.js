/**
 * UserController#create
 *
 */

import { values } from 'ramda';
import { createUser } from '../../../services/UserService';
import { anyAreNil } from '../../../helpers/utils';

export default function create(req, res) {
  const { username } = req.body;
  const required = { username };

  if (anyAreNil(values(required))) {
    return res.badRequest({...required,
      message: 'Not all required parameters were supplied'});
  }

  return createUser(username)
    .then(([token, user]) => (
      res.created({token: token, username: username, userId: user.id})
    ))
    .catch((err) => {
      res.internalServerError(err);
    });
}
