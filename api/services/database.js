/**
 * Wrapper for database setup and connections
 * @file
 */

import mongoose from 'mongoose';
import log from 'winston';
import CFG from '../../config';
import Promise from 'bluebird';

/**
 * A singleton that sets up the connection to mongoose if it hasn't already
 * been established. Otherwise it returns undefined.
 * @param {Function} cb - optional callback to trigger when connected
 * @returns {Mongoose}
 */
const database = (cb) => {
  if (mongoose.connection.db) {
    if (cb) cb(null, mongoose);
    return mongoose;
  }

  mongoose.Promise = Promise;
  mongoose.connect(CFG.mongoURL, CFG.mongoOpts);

  mongoose.connection.on('error', (err) => log.error(err, mongoose));
  mongoose.connection.once('open', () => {
    log.info(`Connected to Mongoose ${CFG.mongoURL}`);
    if (cb) cb(null, mongoose);
  });

  return mongoose;
};

export default database;
