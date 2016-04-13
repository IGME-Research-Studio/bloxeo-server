/**
 *  key-val-store
 *  Currently sets up an ioredis instance
 *
 *  @file Creates a singleton for a Redis connection
 */

import Redis from 'ioredis';
import CFG from '../../config';

module.exports = new Redis(CFG.redisURL);
