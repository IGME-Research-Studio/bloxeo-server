import Monky from 'monky';
import chai from 'chai';
import database from '../../../api/services/database';
import StateService from '../../../api/services/StateService';

const expect = chai.expect;
const mongoose = database();
const monky = new Monky(mongoose);

mongoose.model('Board', require('../../../api/models/Board.js').schema);
monky.factory('Board', {boardId: '1'});

describe('StateService', function() {

  before((done) => {
    database(done);
  });

  describe('#setState(boardId, state)', () => {
    xit('Should set the state of the board in Redis', (done) => {
      StateService.setState('1', StateService.StateEnum.createIdeasAndIdeaCollections)
      .then((result) => {
        expect(result).to.be.true;
        done();
      });
    });
  });

  describe('#getState(boardId)', () => {
    xit('Should get the state of the board from Redis', (done) => {
      StateService.getState('1')
      .then((result) => {
        expect(result).to.be.an('object');
        done();
      });
    });
  });
});
