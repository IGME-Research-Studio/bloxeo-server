import {expect} from 'chai';
import Promise from 'bluebird';

import {BOARDID, USERNAME} from '../../constants';

import KeyValService from '../../../api/services/KeyValService';

let RedisStub;
const keyGen = (boardId) => `key-for-${boardId}`;

describe('KeyValService', function() {

  beforeEach(function() {
    RedisStub = {
      sadd: this.spy(() => Promise.resolve(1)),
      srem: this.spy(() => Promise.resolve(1)),
    };
    KeyValService.__Rewire__('Redis', RedisStub);
  });

  afterEach(function() {
    KeyValService.__ResetDependency__('Redis');
  });

  describe('#changeUser(operation, boardId, userId)', function() {

    it('should succesfully call sadd', function() {
      return expect(KeyValService.changeUser('add', keyGen,
                                             BOARDID, USERNAME))
        .to.eventually.equal(USERNAME)
        .then(() => {
          expect(RedisStub.sadd).to.have.been.called;
          expect(RedisStub.srem).to.not.have.been.called;
        });
    });

    it('should succesfully call srem', function() {
      return expect(KeyValService.changeUser('remove', keyGen,
                                             BOARDID, USERNAME))
        .to.eventually.equal(USERNAME)
        .then(function() {
          expect(RedisStub.srem).to.have.been.called;
          expect(RedisStub.sadd).to.not.have.been.called;
        });
    });

    describe('#readyUser|#finishVoteUser(boardId, userId)', function() {
      [KeyValService.readyUserToVote,
        KeyValService.readyUserDoneVoting]
       .forEach(function(subject) {
         it('should succesfully call sadd and return the userId', function() {
           return expect(subject(BOARDID, USERNAME))
           .to.eventually.equal(USERNAME)
            .then(function() {
              expect(RedisStub.sadd).to.have.been.called;
              expect(RedisStub.srem).to.not.have.been.called;
            });
         });
       });
    });

    describe('#addUser(boardId, userId, socketId)', function() {
      const SOCKETID = 'socketId123';

      it('should successfully call sadd and return the socketId-userId', function() {
        return expect(KeyValService.addUser(BOARDID, USERNAME, SOCKETID))
        .to.eventually.include(SOCKETID).and.include(USERNAME)
        .then(function() {
          expect(RedisStub.sadd).to.have.been.called;
          expect(RedisStub.srem).to.not.have.been.called;
        });
      });
    });

    describe('#removeUser(boardId, userId, socketId)', function() {
      const SOCKETID = 'socketId123';

      it('should succesfully call sadd and return the userId', function() {
        return expect(KeyValService.removeUser(BOARDID, USERNAME, SOCKETID))
          .to.eventually.include(SOCKETID).and.include(USERNAME)
          .then(function() {
            expect(RedisStub.srem).to.have.been.called;
            expect(RedisStub.sadd).to.not.have.been.called;
          });
      });
    });
  });

  xdescribe('#getUsers(boardId)', () => false);
  xdescribe('#clearKey(boardId)', () => false);
  xdescribe('#setKey(boardId)', () => false);
});
