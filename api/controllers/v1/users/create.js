/**
 * UserController#create
 *
 */

import { isNil } from 'ramda';
import userService from '../../../services/UserService';

export default function create(req, res) {
  const username = req.body.username;

  if (isNil(username)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  userService.create(username)
    .then((user) => res.created(user))
    .catch((err) => {
      res.internalServerError(err);
    });
}
