import { expect } from 'chai';
import jwt from 'jsonwebtoken';

import CFG from '../../../config';
import { encode, verify,
  verifyAndGetId } from '../../../api/services/TokenService';

describe('TokenService', function() {
  const userObj = {_id: '1', username: 'peter-is-stupid'};

  describe('#encode({user})', () => {
    it('should generate JWT token', () => {
      return expect(encode(userObj))
        .to.eventually.be.a('string')
        .then((token) => {
          return expect(jwt.verify(token, CFG.jwt.secret))
            .to.be.an('object')
            .and.to.have.property('username', 'peter-is-stupid');
        });
    });
  });

  describe('#verify(userToken)', () => {
    it('should verify a valid JWT token', () => {
      const token = jwt.sign(userObj, CFG.jwt.secret);

      return expect(verify(token))
        .to.eventually.be.an('object')
        .and.to.have.property('username', 'peter-is-stupid');
    });

    it('should throw on an invalid JWT token', () => {
      const token = jwt.sign(userObj, `I'm not a real secret`);

      return expect(verify(token))
        .to.be.rejectedWith(jwt.JsonWebTokenError);
    });
  });

  describe('#verifyAndGetId(userToken)', () => {
    it('should verify a user an return their _id', () => {
      const token = jwt.sign(userObj, CFG.jwt.secret);

      expect(verifyAndGetId(token))
        .to.eventually.equal('1');
    });
  });
});
