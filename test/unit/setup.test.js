import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import chaiArray from 'chai-array';
import sinomocha from 'sinomocha';
import mochaMongoose from 'mocha-mongoose';

import CFG from '../../config';
import {connectDB, setupFixtures} from '../fixtures';

// Global before block to setup everything
before((done) => {
  chai.use(chaiAsPromised);
  chai.use(sinonChai);
  chai.use(chaiArray);
  sinomocha();
  mochaMongoose(CFG.mongoURL);

  connectDB(function(err, mongoose) {
    setupFixtures(err, mongoose, done);
  });
});
