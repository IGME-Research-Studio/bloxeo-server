/**
* Wrapper for database setup and connections
* @TODO add redis
* @file
*/

import mongoose from 'mongoose';
mongoose.Promise = import 'bluebird';

// @TODO move to configuration
// settings and configuration
// const url = process.env.MONGOLAB_URI || "mongodb://localhost";

const db = function(url) {
  mongoose.connect(url, (err) => {
    if (err) {
      console.log("Could not connect to the database");
      throw err;
    }
  });
};

module.exports = db;
