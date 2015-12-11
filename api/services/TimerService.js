/**
  Timer Service

  @file Contains the logic for the server-side timer used for voting on client-side
*/
const config = require('../../config');
const Redis = require('redis');
const pub = Redis.createClient(config.default.redisURL);
const sub = Redis.createClient(config.default.redisURL);
const DTimer = require('dtimer').DTimer;
const dt = new DTimer('timer', pub, sub);
const EXT_EVENTS = require('../constants/EXT_EVENT_API');
const stream = require('../event-stream').default;
const timerService = {};

dt.on('event', function(eventData) {
  stream.ok(EXT_EVENTS.TIMER_EXPIRED, eventData, boardId);
});

dt.join(function(err) {
  if (err) {
    throw new Error(err);
  }
});

/**
* Returns a promise containing a boolean if the timer started correctly
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {number} timerLengthInSeconds: A number containing the amount of seconds the timer should last
* @param (optional) {string} value: The value to store from setting the key in Redis
*/

timerService.startTimer = function(boardId, timerLengthInMilliseconds) {
  return new Promise(function(resolve, reject) {
    try {
      dt.post({boardId: boardId}, timerLengthInMilliseconds, function(err, eventId) {
        if (err) {
          reject(new Error(err));
        }
        resolve(eventId);
      });
    }
    catch (e) {
      reject(e);
    }
  });
};

/**
* Returns a promise containing a boolean which indicates if the timer was stopped
* @param {string} boardId: The string id generated for the board (not the mongo id)
*/
timerService.stopTimer = function(boardId, eventId) {
  return new Promise(function(resolve, reject) {
    try {
      dt.cancel(eventId, function(err) {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    }
    catch (e) {
      reject(e);
    }
  });
};

module.exports = timerService;
