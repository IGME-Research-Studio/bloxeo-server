export const routes = {
  routes: [
    {path: '/v1/boards', method: 'POST',
     handler: require('./controllers/v1/boards/create')},
    {path: '/v1/boards', method: 'DELETE',
     handler: require('./controllers/v1/boards/destroy')},
  ],
};
