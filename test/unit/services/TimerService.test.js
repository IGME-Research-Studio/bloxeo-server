import Monky from 'monky';
import chai from 'chai';
import database from '../../../api/services/database';
import TimerService from '../../../api/services/TimerService';

const expect = chai.expect;
const mongoose = database();
const monky = new Monky(mongoose);

mongoose.model('Board', require('../../../api/models/Board.js').schema);
monky.factory('Board', {boardId: '1'});

describe('TimerService', function() {

  before((done) => {
    database(done);
  });

  describe('#startTimer(boardId, timerLengthInSeconds, (optional) value)', () => {
    it('Should start the server timer on Redis', (done) => {
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
    it('Should get the time left on the sever timer from Redis', (done) => {
      TimerService.getTimeLeft('1')
      .then((result) => {
        expect(result).to.be.a('number');
        done();
      });
    });
  });
});
