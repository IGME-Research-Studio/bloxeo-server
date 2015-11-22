/**
  Timer Service

  @file Contains the logic for the server-side timer used for voting on client-side
*/
const RedisService = require('./RedisService');
const timerService = {};
const iDExtenstion = 'Timer_ID';

/**
* Returns a promise containing a boolean if the timer started correctly
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {number} timerLengthInSeconds: A number containing the amount of seconds the timer should last
* @param (optional) {string} value: The value to store from setting the key in Redis
*/
timerService.startTimer = function(boardId, timerLengthInSeconds, value) {
  const timerId = boardId + iDExtenstion;
  return RedisService.setex(timerId, timerLengthInSeconds, value).then(function(result) {
    if (result.toLowerCase() === 'ok') {
      return true;
    }
    else {
      return false;
    }
  });
};

/**
* Returns a promise containing a boolean which indicates if the timer was stopped
* @param {string} boardId: The string id generated for the board (not the mongo id)
*/
timerService.stopTimer = function(boardId) {
  const timerId = boardId + iDExtenstion;
  return RedisService.del(timerId).then(function(result) {
    if (result > 0) {
      return true;
    }
    else {
      return false;
    }
  });
};

/**
* Returns a promise containing the time to live (ttl) of the key in seconds
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @return: rturns 0 if the key doesn't exist or expired
*/
timerService.getTimeLeft = function(boardId) {
  const timerId = boardId + iDExtenstion;
  return RedisService.ttl(timerId).then(function(result) {
    if (result <= 0) {
      return 0;
    }
    else {
      return result;
    }
  });
};

module.exports = timerService;
