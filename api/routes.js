export default {
  routes: [
    {
      path: '/v1/boards',
      method: 'POST',
      handler: import './controllers/v1/boards/create',
    },
    {
      path: '/v1/boards',
      method: 'DELETE',
      handler: import './controllers/v1/boards/destroy',
    },
  ],
};
