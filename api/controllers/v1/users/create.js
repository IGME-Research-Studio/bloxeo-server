/**
 * UserController#create
 *
 */

import { values } from 'ramda';
import userService from '../../../services/UserService';
import { anyAreNil } from '../../../helpers/utils';

export default function create(req, res) {
  const { username } = req.body;
  const required = { username };

  if (anyAreNil(values(required))) {
    return res.badRequest({...required,
      message: 'Not all required parameters were supplied'});
  }

  return userService.create(username)
    .then((token) => res.created({token: token, username: username}))
    .catch((err) => {
      res.internalServerError(err);
    });
}
