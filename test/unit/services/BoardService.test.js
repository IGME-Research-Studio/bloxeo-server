import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mochaMongoose from 'mocha-mongoose';
import Monky from 'monky';
import sinomocha from 'sinomocha';
import {toClient} from '../../../api/services/utils';

import CFG from '../../../config';
import database from '../../../api/services/database';
import BoardService from '../../../api/services/BoardService';

import {schema as BoardSchema, model as BoardModel} from '../../../api/models/Board';
import {schema as UserSchema} from '../../../api/models/User';

chai.use(chaiAsPromised);
sinomocha();
const expect = chai.expect;

mochaMongoose(CFG.mongoURL);
const mongoose = database();
const monky = new Monky(mongoose);

const DEF_BOARDID = 'boardid';

mongoose.model('Board', BoardSchema);
mongoose.model('User', UserSchema);

monky.factory('Board', {boardId: DEF_BOARDID});
monky.factory('User', {username: 'yolo'});

describe('BoardService', function() {

  before((done) => {
    database(done);
  });

  describe('#create()', () => {

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

  describe('#addAdmin(boardId, userId)', function() {
    let DEF_USERID;

    beforeEach((done) => {
      monky.create('User')
        .then((user) => {
          monky.create('Board', {boardId: DEF_BOARDID, users: [user]})
            .then((board) => {
              DEF_USERID = board.users[0].id;
              done();
            });
        });
    });

    it('should add the existing user as an admin on the board', function(done) {
      BoardService.addAdmin(DEF_BOARDID, DEF_USERID)
        .then((board) => {
          expect(toClient(board.admins[0])).to.equal(DEF_USERID);
          done();
        });
    });

    it('should reject if the user does not exist on the board', function() {
      return expect(BoardService.addAdmin(DEF_BOARDID, 'a-user-not-on-the-board'))
        .to.be.rejectedWith(Promise.OperationalError, /does not exist on the board/);
    });

    xit('should reject if the user is already an admin on the board', function() {
    });
  });

  describe('#isAdmin(board, userId)', function() {
  });

  describe('#isUser(board, userId)', function() {
    let DEF_USERID;

    beforeEach((done) => {
      monky.create('User')
        .then((user) => {
          monky.create('Board', {boardId: DEF_BOARDID, users: [user]})
            .then((board) => {
              DEF_USERID = board.users[0].id;
              done();
            });
        });
    });

    it('should return true when the user exists', function() {
      return BoardModel.findOne({boardId: DEF_BOARDID})
        .then((board) => {
          return expect(BoardService.isUser(board, DEF_USERID))
            .to.equal(true);
        });
    });

    it('should return false when the user doesn\'t exists', function() {
      return BoardModel.findOne({boardId: DEF_BOARDID})
        .then((board) => {
          return expect(BoardService.isUser(board, 'a nonexistant userid'))
            .to.equal(false);
        });
    });
  });
});
