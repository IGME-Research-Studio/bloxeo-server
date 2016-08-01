import createBoard from './controllers/v1/boards/create';
import destroyBoard from './controllers/v1/boards/destroy';
import exists from './controllers/v1/boards/exists';
import createUser from './controllers/v1/users/create';
import validateToken from './controllers/v1/auth/validate';

export default {
  routes: [
    {
      path: '/v1/boards',
      method: 'POST',
      handler: createBoard,
    },
    {
      path: '/v1/boards',
      method: 'DELETE',
      handler: destroyBoard,
    },
    {
      path: '/v1/boards',
      method: 'GET',
      handler: exists,
    },
    {
      path: '/v1/users',
      method: 'POST',
      handler: createUser,
    },
    {
      path: '/v1/auth/validate',
      method: 'POST',
      handler: validateToken,
    },
  ],
};
