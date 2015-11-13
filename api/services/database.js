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

    mongoose.connection.on('error', rej);
    mongoose.connection.once('open', res);
    // Maybe we should figure out how to reconnect?
    // mongoose.connection.on('disconnected', mongo.bind(this, url, options));
  });
};

const redis = function(url) {

};

export { redis };
export { mongo };
