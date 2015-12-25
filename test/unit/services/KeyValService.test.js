import {expect} from 'chai';
import Promise from 'bluebird';
import rewire from 'rewire';

import {BOARDID, USERNAME} from '../../constants';

import KeyValService from '../../../api/services/KeyValService';

let RedisStub;

describe('KeyValService', function() {

  before(function() {
    RedisStub = {
      sadd: this.spy(() => Promise.resolve(1)),
      srem: this.spy(() => Promise.resolve(1)),
    };
    KeyValService.__Rewire__('Redis', RedisStub);
  });

  after(function() {
    KeyValService.__ResetDependency__('Redis');
  });

  describe('#changeUser(operation, boardId, userId)', function() {

    it('should succesfully call sadd', function() {
      expect(KeyValService.changeUser('add', BOARDID, USERNAME))
        .to.eventually.equal(1);
      expect(RedisStub.sadd).to.have.been.called;
      expect(RedisStub.srem).to.not.have.been.called;
    });

    it('should succesfully call srem', function() {

    });
  });
});
