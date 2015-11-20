import createBoard from './controllers/v1/boards/create';
import destroyBoard from './controllers/v1/boards/destroy';

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
  ],
};
