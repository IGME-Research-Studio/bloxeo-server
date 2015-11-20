/**
* Wrapper for database setup and connections
* @TODO add redis
* @file
*/

import mongoose from 'mongoose';
import Promise from 'bluebird';

mongoose.Promise = Promise;

const mongo = function(url, options) {
  return new Promise((res, rej) => {
    mongoose.connect(url, options);

    mongoose.connection.on('error', (err) => rej(err));
    mongoose.connection.once('open', () => res(true));
    // Maybe we should figure out how to reconnect?
    // mongoose.connection.on('disconnected', mongo.bind(this, url, options));
  });
};

export default mongo;
