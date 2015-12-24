/**
  Timer Service

  @file Contains the logic for the server-side timer used for voting on client-side
*/
const Redis = require('redis');
const config = require('../../config');
const pub = Redis.createClient(config.default.redisURL);
const sub = Redis.createClient(config.default.redisURL);
const DTimer = require('dtimer').DTimer;
const dt = new DTimer('timer', pub, sub);

const EXT_EVENTS = require('../constants/EXT_EVENT_API');
const stream = require('../event-stream').default;
const StateService = require('./StateService');
const RedisService = require('./RedisService');
const self = {};
const suffix = '-timer';

dt.on('event', function(eventData) {
  StateService.createIdeaCollections(eventData.boardId, false, null)
  .then((state) => {
    RedisService.del(eventData.boardId + suffix);
    stream.ok(EXT_EVENTS.TIMER_EXPIRED, {boardId: eventData.boardId, state: state}, eventData.boardId);
  });
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
self.startTimer = function(boardId, timerLengthInMilliseconds) {
  return new Promise(function(resolve, reject) {
    try {
      dt.post({boardId: boardId}, timerLengthInMilliseconds, function(err, eventId) {
        if (err) {
          reject(new Error(err));
        }
        const timerObj = {timeStamp: new Date(), timerLength: timerLengthInMilliseconds};
        return RedisService.set(boardId + suffix, JSON.stringify(timerObj))
        .then(() => {
          resolve(eventId);
        });
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
self.stopTimer = function(boardId, eventId) {
  return new Promise(function(resolve, reject) {
    try {
      dt.cancel(eventId, function(err) {
        if (err) {
          reject(err);
        }
        RedisService.del(boardId + suffix);
        resolve(true);
      });
    }
    catch (e) {
      reject(e);
    }
  });
};

/**
* Returns a promise containing the time left
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @return the time left in milliseconds. 0 indicates the timer has expired
*/
self.getTimeLeft = function(boardId) {
  const currentDate = new Date();

  return RedisService.get(boardId + suffix)
  .then(function(result) {

    if (result === null) {
      return null;
    }
    else {
      const timerObj = JSON.parse(result);
      const timeStamp = new Date(timerObj.timeStamp);
      const timerLength = timerObj.timerLength;

      const difference = currentDate.getTime() - timeStamp.getTime();

      if (difference >= timerLength) {
        return 0;
      }
      else {
        return timerLength - difference;
      }
    }
  });
};

module.exports = self;
