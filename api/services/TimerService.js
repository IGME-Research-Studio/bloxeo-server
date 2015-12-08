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

/**
* Returns a promise containing a boolean if the timer started correctly
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {number} timerLengthInSeconds: A number containing the amount of seconds the timer should last
* @param (optional) {string} value: The value to store from setting the key in Redis
*/

timerService.startTimer = function(boardId, timerLengthInMilliseconds) {

  dt.on('event', function(eventData) {
    console.log('Event completed: ' + eventData.key);
  });

  dt.join(function(err) {
    if (err) {
      reject(new Error(err));
    }
  });

  return new Promise(function(resolve, reject) {
    try {
      dt.post({key: boardId}, timerLengthInMilliseconds, function(err, eventId) {
        if (err) {
          reject(new Error(err));
        }
        stream.emit(EXT_EVENTS.START_TIMER, {boardId});
        resolve(eventId);
      });
    }
    catch(e) {
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
        console.log('canceled the timer for event id: ' + eventId);
        resolve(true);
      });
    }
    catch(e) {
      reject(e);
    }
  })
};

/**
* Returns a promise containing the time to live (ttl) of the key in seconds
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @return: rturns 0 if the key doesn't exist or expired
*/
// timerService.getTimeLeft = function(boardId) {
//   const timerId = boardId + iDExtenstion;
//   return RedisService.ttl(timerId).then(function(result) {
//     if (result <= 0) {
//       return 0;
//     }
//     else {
//       return result;
//     }
//   });
// };

module.exports = timerService;
