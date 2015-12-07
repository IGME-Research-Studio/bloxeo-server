import chai from 'chai';
import jwt from 'jsonwebtoken';

import TokenService from '../../../api/services/TokenService';
import CFG from '../../../config';

const expect = chai.expect;

describe('TokenService', function() {
  const userObj = {username: 'peter-is-stupid'};

  it('should generate JWT token', () => {
    return expect(TokenService.encode(userObj))
      .to.eventually.be.a('string')
      .then((token) => {
        return expect(jwt.verify(token, CFG.jwt.secret))
          .to.be.an('object')
          .and.to.have.property('username', 'peter-is-stupid');
      });
  });

  it('should decode a valid JWT token', () => {
    const token = jwt.sign(userObj, CFG.jwt.secret);

    return expect(TokenService.verify(token))
      .to.eventually.be.an('object')
      .and.to.have.property('username', 'peter-is-stupid');
  });

  it('should throw on an invalid JWT token', () => {
    const token = jwt.sign(userObj, `I'm not a real secret`);

    return expect(TokenService.verify(token))
      .to.be.rejectedWith(jwt.JsonWebTokenError);
  });
});
