import {expect} from 'chai';

import {Types} from 'mongoose';
import {monky} from '../../fixtures';
import {BOARDID} from '../../constants';

import { toPlainObject } from '../../../api/helpers/utils';
import { NotFoundError, NoOpError } from '../../../api/helpers/extendable-error';
import {model as BoardModel} from '../../../api/models/Board';
import BoardService from '../../../api/services/BoardService';

describe('BoardService', function() {

  describe('#create()', () => {
    let USERID;

    beforeEach((done) => {
      monky.create('User')
      .then((user) => {
        USERID = user._id;
        done();
      });
    });

    it('should create a board and return the correct boardId', (done) => {
      return BoardService.create(USERID, 'title', 'description')
        .then((createdBoardId) => {
          return Promise.all([
            Promise.resolve(createdBoardId),
            BoardModel.findOne({boardId: createdBoardId}),
          ]);
        })
        .then(([boardId, board]) => {
          expect(boardId).to.be.a('string');
          expect(board.name).to.equal('title');
          expect(board.description).to.equal('description');
          expect(BoardService.exists(boardId)).to.eventually.be.true;
          done();
        });
    });

    it('should add the creating user as the admin', () => {
      return expect(BoardService.create(USERID))
        .to.be.fulfilled
        .then((createdBoardId) => {
          return BoardModel.findOne({boardId: createdBoardId})
            .then((createdBoard) => {
              expect(toPlainObject(createdBoard.admins[0]))
                .to.equal(toPlainObject(USERID));
              expect(toPlainObject(createdBoard.users[0]))
                .to.equal(toPlainObject(USERID));
            });
        });
    });
  });

  describe('#addUser(boardId, userId)', function() {
    let USERID;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('User')
          .then((user) => {
            USERID = user.id;
            done();
          }),
      ]);
    });

    it('should add the existing user as an admin on the board', function(done) {
      BoardService.addUser(BOARDID, USERID)
        .then(([board, additionsToRoom]) => {
          expect(toPlainObject(board.users[0])).to.equal(USERID);
          expect(additionsToRoom).to.equal(USERID);
          done();
        });
    });

    it('should reject if the user does not exist on the board', function() {
      const userThatDoesntExist = Types.ObjectId();
      return expect(BoardService.addUser(BOARDID, userThatDoesntExist))
        .to.be.rejectedWith(NotFoundError, new RegExp(userThatDoesntExist, 'gi'));
    });
  });

  describe('#addAdmin(boardId, userId)', function() {
    let USERID;
    let USERID_2;

    beforeEach((done) => {
      Promise.all([
        monky.create('User'),
        monky.create('User'),
      ])
      .then((users) => {
        monky.create('Board', {boardId: BOARDID, users: users, admins: [users[1]]})
        .then((board) => {
          USERID = board.users[0].id;
          USERID_2 = board.users[1].id;
          done();
        });
      });
    });

    it('should add the existing user as an admin on the board', function() {
      return BoardService.addAdmin(BOARDID, USERID)
        .then((board) => {
          return expect(toPlainObject(board.admins)).to.include(USERID);
        });
    });

    it('should reject if the user does not exist on the board', function() {
      return expect(BoardService.addAdmin(BOARDID, 'user-not-on-the-board'))
        .to.be.rejectedWith(NotFoundError, /does not exist/);
    });

    it('should reject if the user is already an admin on the board', function() {
      return expect(BoardService.addAdmin(BOARDID, USERID_2))
        .to.be.rejectedWith(NoOpError, /is already an admin on the board/);
    });
  });

  describe('#isAdmin(board, userId)', function() {
  });

  describe('#isUser(board, userId)', function() {
    let USERID;

    beforeEach((done) => {
      monky.create('User')
        .then((user) => {
          monky.create('Board', {boardId: BOARDID, users: [user]})
            .then((board) => {
              USERID = board.users[0].id;
              done();
            });
        });
    });

    it('should return true when the user exists', function() {
      return BoardModel.findOne({boardId: BOARDID})
        .then((board) => {
          return expect(BoardService.isUser(board, USERID))
            .to.equal(true);
        });
    });

    it('should return false when the user doesn\'t exists', function() {
      return BoardModel.findOne({boardId: BOARDID})
        .then((board) => {
          return expect(BoardService.isUser(board, 'a nonexistant userid'))
            .to.equal(false);
        });
    });
  });

  describe('#getUsers(boardId)', () => {
    beforeEach((done) => {
      Promise.all([
        monky.create('User'),
      ])
      .then((users) => {
        monky.create('Board', {boardId: BOARDID, users: users})
        .then(() => {
          done();
        });
      });
    });

    it('Should throw a not found error if the board does not exist', () => {
      return expect(BoardService.getUsers('notRealId')).to.eventually.be.rejectedWith(NotFoundError);
    });

    it('Should return the users on the board', (done) => {
      return BoardService.getUsers(BOARDID)
      .then((users) => {
        expect(users).to.have.length(1);
        done();
      });
    });
  });

  describe('#getBoardOptions(boardId)', () => {
    beforeEach((done) => {
      monky.create('Board')
      .then(() => {
        done();
      });
    });

    it('Should return the board options', (done) => {
      return BoardService.getBoardOptions(BOARDID)
      .then((options) => {
        expect(options).to.be.an('object');
        expect(options).to.have.property('userColorsEnabled');
        expect(options).to.have.property('numResultsShown');
        expect(options).to.have.property('numResultsReturn');
        done();
      });
    });
  });
});
