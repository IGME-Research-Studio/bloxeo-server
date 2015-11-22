/**
  Redis Service

  @file Creates a singleton for a Redis connection
*/
const Redis = require('ioredis');
const config = require('../../config');
const redisURL = config.redisURL;
const redis = new Redis(redisURL);

module.exports = redis;
