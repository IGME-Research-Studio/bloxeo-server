import chai from 'chai';
import jwt from 'jsonwebtoken';

import TokenService from '../../../api/services/TokenService';
import CFG from '../../../config';

const expect = chai.expect;

describe('IdeaCollectionService', function() {
  const userObj = {username: 'peter-is-stupid'};

  it('should generate JWT token', () => {
    const token = TokenService.generateNewToken(userObj)

    expect(token).to.be('string');
    expect(jwt.decode(token, CFG.jwt.secret))
      .to.have.property('username', 'peter-is-stupid');
  });

  it('should decode JWT token', () => {

  });
});
