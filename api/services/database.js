/**
* Wrapper for database setup and connections
* @TODO add redis
* @file
*/

const mongoose = require('mongoose');

// @TODO move to configuration
// settings and configuration
const url = process.env.MONGOLAB_URI || "mongodb://localhost";

const db = mongoose.connect(url, function(err){
  if(err){
    console.log("Could not connect to the database");
    throw err;
  }
});

module.exports = db;
