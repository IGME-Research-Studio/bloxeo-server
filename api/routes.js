import createBoard from './controllers/v1/boards/create';
import destroyBoard from './controllers/v1/boards/destroy';
import burnSails from './controllers/index';

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
      path: '/',
      method: 'GET',
      handler: burnSails,
    },
  ],
};
