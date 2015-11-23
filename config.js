import rc from 'rc';
import crypto from 'crypto';

let mongoURL;
switch (process.env.NODE_ENG) {
case 'TEST':
case 'test':
  mongoURL = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/jails-test';
  break;
case 'PROD':
case 'prod':
  mongoURL = process.env.MONGOLAB_URI || 'mongodb://localhost:27017';
  break;
default:
  mongoURL = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/jails';
  break;
}

const DEFAULT_CFG = {
  mongoURL: mongoURL,
  mongoOpts: { server: { socketOptions: { keepAlive: 1 } } },
  redisURL: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  port: process.env.PORT || '1337',
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    timeout: process.env.JWT_TIMEOUT || 15000,
  },
};

export default rc('jails', DEFAULT_CFG);
