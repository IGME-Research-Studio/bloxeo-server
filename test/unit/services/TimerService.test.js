import { expect } from 'chai';
import { startTimer, stopTimer,
  getTimeLeft } from '../../../api/services/TimerService';

describe('TimerService', function() {

  describe('#startTimer(boardId, timerLengthInSeconds)', () => {
    it('Should start the server timer', (done) => {
      startTimer('abc123', '10000')
      .then((timerId) => {
        expect(timerId).to.be.a('string');
        done();
      });
    });
  });

  describe('#stopTimer(boardId)', () => {
    const timerObj = {};

    beforeEach(function(done) {
      startTimer('abc123', '10000')
      .then((timerId) => {
        timerObj.timerId = timerId;
        done();
      });
    });

    it('Should stop the server timer on Redis', (done) => {
      stopTimer(timerObj.timerId)
      .then((timerDataObj) => {
        expect(timerDataObj).to.be.an('object');
        done();
      });
    });
  });

  describe('#getTimeLeft(boardId)', () => {
    const timerObj = {};

    beforeEach(function(done) {
      startTimer('abc123', '10000')
      .then((timerId) => {
        timerObj.timerId = timerId;
        done();
      });
    });

    it('Should get the time left on the sever timer from Redis', (done) => {
      getTimeLeft(timerObj.timerId)
      .then((timeLeft) => {
        expect(timeLeft).to.be.a('number');
        done();
      });
    });
  });
});
