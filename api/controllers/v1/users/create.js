/**
 * UserController#create
 *
 */

import userService from '../../../services/UserService';

export default function create(req, res) {
  userService.create()
    .then((user) => res.created(user))
    .catch((err) => res.serverError(err));
}
