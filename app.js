/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *   => `node app.js`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *   => `modulus deploy`
 *   => `heroku scale`
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

require('babel/register');
const rc = require('rc')

const DEFAULT_CONFIG = {
  apiVersion: 1,
  mongoURL: process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
  port: process.env.PORT || '1337',
};

const MERGED_CONFIG = rc('jails', DEFAULT_CONFIG);

console.log(MERGED_CONFIG);
