import rc from 'rc';
import crypto from 'crypto';
import log from 'winston';

let mongoURL;
switch (process.env.NODE_ENV) {
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
  logLevel: 'debug',
  mongoURL: mongoURL,
  mongoOpts: { server: { socketOptions: { keepAlive: 1 } } },
  redisURL: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  port: process.env.PORT || '1337',
  jwt: {
    // generated by: `crypto.randomBytes(64).toString('hex')`
    secret: process.env.JWT_SECRET || 'fbb578770e383dad9a5663d570972efd76b54f0a1f47b405c9fc4e2e918884ee1eedfbf439cba00d1d9f7f14ac78926e9db54c44a7c8305635d516af6fb26b00',
    timeout: process.env.JWT_TIMEOUT || '1s',
  },
};

export default rc('jails', DEFAULT_CFG);
