import createBoard from './controllers/v1/boards/create';
import destroyBoard from './controllers/v1/boards/destroy';
import burnSails from './controllers/index';
import createUser from './controllers/v1/users/create';

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
      path: '/v1/users',
      method: 'POST',
      handler: createUser,
    },
    {
      path: '/',
      method: 'GET',
      handler: burnSails,
    },
  ],
};
