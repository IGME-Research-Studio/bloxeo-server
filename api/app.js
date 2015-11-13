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

import routes from './routes';

const extendedExpress = addStatusCodes(express);

const DEFAULT_CFG = {
  mongoURL: process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
  port: process.env.PORT || '1337',
};
const CFG = rc('jails', DEFAULT_CFG);
const app = extendedExpress();

app
  .use(logger('dev'))
  .use(compression())
  .use(bodyParser.urlencoded({extended: true}))
  .use(enrouten(routes))
  .disable('x-powered-by')
  ;

app.listen(CFG.port, function(err) {
  if (err) throw err;

  console.log(CFG);
  console.log(routes);
  console.log('Listening on port: ', CFG.port);
});

