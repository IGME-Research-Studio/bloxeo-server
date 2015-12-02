import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mochaMongoose from 'mocha-mongoose';
import Monky from 'monky';

import CFG from '../../../config';
import database from '../../../api/services/database';
import BoardService from '../../../api/services/BoardService.js';

chai.use(chaiAsPromised);
const expect = chai.expect;
const DEF_BOARDID = '3';

const mongoose = database();
const clearDB = mochaMongoose(CFG.mongoURL, {noClear: true});
const monky = new Monky(mongoose);

mongoose.model('Board', require('../../../api/models/Board.js').schema);

monky.factory('Board', {boardId: DEF_BOARDID});

describe('BoardService', function() {

  before((done) => {
    database(done);
  });

  describe('#create()', () => {

    afterEach((done) => clearDB(done));

    it('should create a board and return the correct boardId', (done) => {
      BoardService.create()
        .then((createdBoardId) => {
          try {
            expect(createdBoardId).to.be.a('string');
            expect(BoardService.exists(createdBoardId))
              .to.become(true).notify(done);
          }
          catch (e) {
            done(e);
          }
        });
    });
  });
});
