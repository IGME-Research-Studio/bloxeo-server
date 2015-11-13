import rc from 'rc';
import path from 'path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import url from 'url';
import csrf from 'csurf';
import enrouten from 'express-enrouten';
import logger from 'morgan';
import addStatusCodes from 'express-json-status-codes';
import mongoose from 'mongoose';

import routes from './routes';
import { mongo, redis } from './services/database';

const extendedExpress = addStatusCodes(express);
const DEFAULT_CFG = {
  mongoURL: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/jails',
  mongoOpts: { server: { socketOptions: { keepAlive: 1 } } },
  port: process.env.PORT || '1337',
};
const CFG = rc('jails', DEFAULT_CFG);

mongo(CFG.mongoURL, CFG.mongoOpts)
  .then(() => setupApp());

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

