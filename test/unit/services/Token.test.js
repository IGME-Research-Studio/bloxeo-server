import chai from 'chai';
import jwt from 'jsonwebtoken';

import TokenService from '../../../api/services/TokenService';
import CFG from '../../../config';

const expect = chai.expect;

describe('TokenService', function() {
  const userObj = {username: 'peter-is-stupid'};

  it('should generate JWT token', () => {
    const token = TokenService.generateNewToken(userObj);

    expect(token).to.be.a('string');
    expect(jwt.verify(token, CFG.jwt.secret))
      .to.have.property('username', 'peter-is-stupid');
  });

  it('should decode JWT token', () => {

    const token = TokenService.generateNewToken(userObj);
    const decodedToken = TokenService.authenticateToken(token);

    expect(decodedToken).to.be.a('object');
    expect(decodedToken).to.have.property('username', 'peter-is-stupid');
  });
});
