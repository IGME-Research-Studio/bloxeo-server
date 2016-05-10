/**
 * Timer Service
 *
 * @file Contains the logic for the server-side timer used for voting on client
 */
import CFG from '../../config';
import Radicchio from 'radicchio';
import { TIMER_EXPIRED } from '../constants/EXT_EVENT_API';
import stream from '../eventStream';
import { createIdeaCollections } from './StateService';

const radicchio = Radicchio(CFG.redisURL);

radicchio.on('expired', function(timerDataObj) {
  const boardId = timerDataObj.boardId;

  createIdeaCollections(boardId, false, null)
  .then((state) => {
    stream.ok(TIMER_EXPIRED, {boardId: boardId, state: state}, boardId);
  });
});

/**
* Returns a promise containing a the timer id
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {number} timerLengthInMS: A number containing the amount of milliseconds the timer should last
*/
export const startTimer = function(boardId, timerLengthInMS) {
  const dataObj = {boardId: boardId};

  return new Promise(function(resolve, reject) {
    try {
      radicchio.startTimer(timerLengthInMS, dataObj)
      .then((timerId) => {
        resolve(timerId);
      });
    }
    catch (e) {
      reject(e);
    }
  });
};

/**
* Returns a promise containing a data object associated with the timer
* @param {string} timerId: The timer id to stop
*/
export const stopTimer = function(timerId) {
  return new Promise(function(resolve, reject) {
    try {
      radicchio.deleteTimer(timerId)
      .then((data) => {
        delete data.boardId;
        resolve(data);
      });
    }
    catch (e) {
      reject(e);
    }
  });
};

/**
* Returns a promise containing the time left
* @param {string} timerId: The timer id to get the time left on
*/
export const getTimeLeft = function(timerId) {
  return new Promise(function(resolve, reject) {
    try {
      radicchio.getTimeLeft(timerId)
      .then((timerObj) => {
        resolve(timerObj.timeLeft);
      });
    }
    catch (e) {
      reject(e);
    }
  });
};
