import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import enrouten from 'express-enrouten';
import logger from 'morgan';
import cors from 'cors';
import addStatusCodes from 'express-json-status-codes';
import log from 'winston';
// import redis from 'ioredis';

import CFG from '../config';
import routes from './routes';
import dispatcher from './dispatcher';
import database from './services/database';

// const redisClient = Redis(CFG.redisURL);
const extendedExpress = addStatusCodes(express);

const setupApp = function() {
  return extendedExpress()
    .use(logger('dev'))
    .use(compression())
    .use(cors())
    .use(bodyParser.urlencoded({extended: true}))
    .use(enrouten(routes))
    .disable('x-powered-by')
    .listen(CFG.port, function(err) {
      if (err) throw err;
      log.info('Listening on port: ', CFG.port);
    });
};

database(CFG.mongoURL, CFG.mongoOpts)
  .then(() => log.info('Connected to mongo'))
  .catch(log.error);

const app = setupApp();
dispatcher(app);

export { app };

