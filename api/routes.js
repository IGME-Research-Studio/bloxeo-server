import boardCreate from './controllers/v1/boards/create';
import boardDestroy from './controllers/v1/boards/destroy';

export default {
  routes: [
    {
      path: '/v1/boards',
      method: 'POST',
      handler: boardCreate,
    },
    {
      path: '/v1/boards',
      method: 'DELETE',
      handler: boardDestroy,
    },
  ],
};
