// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.

import rc from 'rc';
import path from 'path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import url from 'url';
import csrf from 'csurf';
import enrouten from 'express-enrouten';

import routes from './routes.js';

const DEFAULT_CFG = {
  mongoURL: process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
  port: process.env.PORT || '1337',
};
const CFG = rc('jails', DEFAULT_CFG);


const app = express();

app.use(compression())
  .use(enrouten(routes))
  .use(bodyParser.urlencoded({extended: true}))
  .disable('x-powered-by')
  .use(csrf())
  .use(function(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    return;
  });

app.listen(CFG.port, function(err) {
  if (err) throw err;

  console.log(CFG);
  console.log('Listening on port: ', CFG.port);
});

