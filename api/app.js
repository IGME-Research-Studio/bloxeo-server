import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import enrouten from 'express-enrouten';
import logger from 'morgan';
import addStatusCodes from 'express-json-status-codes';
import Promise from 'bluebird';
// import redis from 'ioredis';

import CFG from './config';
import routes from './routes';
import dispatcher from './dispatcher';
import database from './services/database';

// const redisClient = Redis(CFG.redisURL);
const extendedExpress = addStatusCodes(express);

const setupApp = function() {
  return extendedExpress()
    .use(logger('dev'))
    .use(compression())
    .use(bodyParser.urlencoded({extended: true}))
    .use(enrouten(routes))
    .disable('x-powered-by')
    .listen(CFG.port, function(err) {
      if (err) throw err;
      console.log('Listening on port: ', CFG.port);
    });
};

database(CFG.mongoURL, CFG.mongoOpts)
  .then(() => console.log('Connected to mongo'))
  .catch(console.error);

const app = setupApp();
const dispatch = dispatcher(app);

export { app }

