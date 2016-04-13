import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import enrouten from 'express-enrouten';
import logger from 'morgan';
import cors from 'cors';
import addStatusCodes from 'express-json-status-codes';
import log from 'winston';

import CFG from '../config';
import routes from './routes';
import dispatcher from './dispatcher';
import database from './helpers/database';

const extendedExpress = addStatusCodes(express);
log.level = CFG.logLevel;

const setupApp = function() {
  return extendedExpress()
    .use(logger('dev'))
    .use(compression())
    .use(cors())
    .use(bodyParser.json())
    .use(enrouten(routes))
    .disable('x-powered-by')
    .listen(CFG.port, function(err) {
      if (err) throw err;
      log.info('Listening on port: ', CFG.port);
    });
};

database();
const app = setupApp();
dispatcher(app);

export { app };
