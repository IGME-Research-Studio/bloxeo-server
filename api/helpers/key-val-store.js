/**
  Redis Service
  @file Creates a singleton for a Redis connection
*/
const Redis = require('ioredis');
const config = require('../../config');
const redisURL = config.default.redisURL;

module.exports = new Redis(redisURL);
