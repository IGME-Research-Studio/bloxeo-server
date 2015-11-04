/**
* REST_API
*
* These are the routes that client will use to make calls to our API in the
* form of reqwest objects serialized as lodash templates.
*
* @example
* io.socket.post(ROUTES.createIdea, (body, jwr) => {
*   // body === jwr.body, jwr also has headers and params
* })
*
* # Reqwest usage
* reqwest(params)
*   .then((res) => doSomething(res))
*   .fail((err, msg) => handleProblems(err, msg))
*   .always((res) => console.log('Did it!');
*
* # We provide the params object as a lodash stringified JSON object
* params = {
*   url: 'api/path',
*   method: 'POST', # GET/PUT/etc.
*   data: {someData: 2},
*   type: 'json',
* }
*/

// const prefix = require('../services/VersionService').prefixRoute;
const VersionService = require('../services/VersionService');
const prefix = VersionService.prefixTemplateRoute.bind(VersionService);
const _ = require('lodash');

/*
* @todo: I would like to find a nice way to send the method along, so that
* we could change the method from a post to a delete for example and client
* wouldn't have to know we changed it.
*/
const REST_API = {
  // Boards
  getBoards: '/boards',
  getBoard: '/boards/<%= boardId %>',
  createBoard: '/boards',
  updateBoard: '/boards/<%= boardId %>',
  deleteBoard: '/boards',

  // Rooms (Socket only)
  joinRoom: '/rooms/<%= boardId %>/join',
  leaveRoom: '/rooms/<%= boardId %>/leave',

  // Ideas
  getIdeas: '/boards/<%= boardId %>/ideas',
  createIdea: '/boards/<%= boardId %>/ideas',
  deleteIdea: '/boards/<%= boardId %>/ideas',

  // IdeaCollections
  getIdeaCollections: '/boards/<%= boardId %>/ideaCollections',
  createIdeaCollection: '/boards/<%= boardId %>/ideaCollections',
  updateIdeaCollection: '/boards/<%= boardId %>/ideaCollections/<%= index %>',
  removeIdeaCollection: '/boards/<%= boardId %>/ideaCollections',

  addIdeaToIdeaCollection: '/boards/<%= boardId %>/ideaCollections/<%= index %>/ideas',
  removeIdeaFromIdeaCollection: '/boards/<%= boardId %>/ideaCollections/<%= index %>/ideas',
};

module.exports = _.mapValues(REST_API, function(route) {
  return prefix(route);
});
