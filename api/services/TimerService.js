/**
  Timer Service

  @file Contains the logic for the server-side timer used for voting on client-side
*/
const RedisService = require('./RedisService.js');
const timerService = {};
const iDExtenstion = 'Timer_ID';

/**
* Returns a promise containing a status message if the timer started correctly ('OK' = Successful)
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {number} timerLengthInSeconds: A number containing the amount of seconds the timer should last
* @param (optional) {string} value: The value to store from setting the key in Redis
*/
timerService.startTimer = function(boardId, timerLengthInSeconds, value) {
  const timerId = boardId + iDExtenstion;
  return RedisService.setex(timerId, timerLengthInSeconds, value);
};

/**
* Returns a promise containing the number of keys deleted which indicates the timer was stopped
* @param {string} boardId: The string id generated for the board (not the mongo id)
*/
timerService.stopTimer = function(boardId) {
  const timerId = boardId + iDExtenstion;
  return RedisService.del(timerId);
};

/**
* Returns a promise containing the time to live (ttl) of the key in seconds
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @return: TTL returns -2 if the key doesn't exist or expired, -1 if the key was not assigned an expiration time
*/
timerService.getTimeLeft = function(boardId) {
  const timerId = boardId + iDExtenstion;
  return RedisService.ttl(timerId);
};

module.exports = timerService;
