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

/*
* @todo: I would like to find a nice way to send the method along, so that
* we could change the method from a post to a delete for example and client
* wouldn't have to know we changed it.
*/
const REST_API = {
  // Boards
  getBoards: ['GET', '/v1/boards'],
  getBoard: ['GET', '/v1/boards/<%= boardId %>'],
  createBoard: ['POST', '/v1/boards'],
  updateBoard: ['PATCH', '/v1/boards/<%= boardId %>'],
  deleteBoard: ['DELETE', '/v1/boards'],
};

module.exports = REST_API;
