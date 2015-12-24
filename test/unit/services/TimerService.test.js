import {expect} from 'chai';
import TimerService from '../../../api/services/TimerService';

describe('TimerService', function() {

  describe('#startTimer(boardId, timerLengthInSeconds, (optional) value)', () => {
    xit('Should start the server timer on Redis', (done) => {
      TimerService.startTimer('1', 10, undefined)
      .then((result) => {
        expect(result).to.be.true;
        done();
      });
    });
  });

  describe('#stopTimer(boardId)', () => {
    it('Should stop the server timer on Redis', (done) => {
      TimerService.stopTimer('1')
      .then((result) => {
        expect(result).to.be.true;
        done();
      });
    });
  });

  describe('#getTimeLeft(boardId)', () => {
    xit('Should get the time left on the sever timer from Redis', (done) => {
      TimerService.getTimeLeft('1')
      .then((result) => {
        expect(result).to.be.a('number');
        done();
      });
    });
  });
});
