/**
  Redis Service

  @file Creates a singleton for a Redis connection
*/
const Redis = require('ioredis');
const redisURL = 'redis://rediscloud:FvcKIlakCbjaqV7p@pub-redis-15473.us-east-1-2.1.ec2.garantiadata.com:15473';

const redis = new Redis(redisURL);

module.exports = redis;
