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
import Redis from 'ioredis';

import CFG from './config';
import routes from './routes';
import db from './services/database';

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPass = redisURL.auth.split(':')[1];
}

const extendedExpress = addStatusCodes(express);

const redis = Redis(CFG.redisURL);

db(CFG.mongoURL, CFG.mongoOpts)
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

