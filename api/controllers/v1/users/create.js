/**
 * UserController#create
 *
 */

import userService from '../../../services/UserService';
import { isNull } from '../../../services/ValidatorService';

export default function create(req, res) {
  const username = req.body.username;

  if (isNull(username)) {
    return res.badRequest(
      {message: 'Not all required parameters were supplied'});
  }

  userService.create(username)
    .then((user) => res.created(user))
    .catch((err) => {
      res.internalServerError(err);
    });
}
