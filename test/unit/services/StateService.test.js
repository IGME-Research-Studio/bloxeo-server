import {expect} from 'chai';

import StateService from '../../../api/services/StateService';

describe('StateService', function() {

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
