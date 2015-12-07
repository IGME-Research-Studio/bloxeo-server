import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinomocha from 'sinomocha';
import sinon from 'sinon';

import TokenService from '../../../api/services/TokenService';
import validateController from '../../../api/controllers/v1/auth/validate';

chai.use(chaiAsPromised);
chai.use(sinonChai);
sinomocha();
const expect = chai.expect;

describe('#validate({userToken}, res)', function() {
  let verifyStub;

  before(function() {
    verifyStub = this.stub(TokenService, 'verify')
      .returns(Promise.resolve({user: 'peter'}));
  });

  it('should return ok for a valid token', function(done) {
    const req = {
      method: 'POST',
      body: {userToken: 'agoodtoken'},
    };
    const res = {
      ok: sinon.spy(),
      unauthorized: sinon.spy(),
      internalServerError: sinon.spy(),
    };

    expect(validateController(req, res))
      .to.be.fulfilled
      .then(() => {
        expect(verifyStub).to.have.been.called;
        expect(res.ok).to.have.been.called;
        console.log('yolo swag');
        done();
      });
  });

  it('should return unauthorized for an invalid token', () => {

  });
});
