/**
* HTTP_API
*
* These are the routes that client will use to make calls to our API in the
* form of reqwest objects serialized as lodash templates.
*
* @example
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

const Immutable = require('immutable');

const baseObj = Immutable.Map({
  url: undefined,
  method: undefined,
  data: '<%= data %>',
  type: 'json',
});

const setMethod = (req, method) => req.set('method', method);

const postReq = (req) => setMethod(req, 'POST');
const getReq = (req) => setMethod(req, 'GET');
const putReq = (req) => setMethod(req, 'PUT');
const patchReq = (req) => setMethod(req, 'PATCH');
const deleteReq = (req) => setMethod(req, 'DELETE');

// module.export = json;
