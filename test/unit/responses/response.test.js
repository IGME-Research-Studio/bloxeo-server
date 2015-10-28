const expect = require('chai').expect;
const _ = require('lodash');

describe('Responses', () => {
  // mock express res object
  const express = {
    unauthorized: require('../../../api/responses/unauthorized'),
    forbidden: require('../../../api/responses/forbidden'),
    badRequest: require('../../../api/responses/badRequest'),
    serverError: require('../../../api/responses/serverError'),
    notFound: require('../../../api/responses/notFound'),
    created: require('../../../api/responses/created'),
    ok: require('../../../api/responses/ok'),
    res: {
      send: () => this,
      status: () => this,
      jsonx: () => this,
    },
  };

  // Test each response type by looking at the keys of the mock express obj
  // that is not res
  _.chain(express)
    .keys()
    .filter((key) => key !== 'res')
    .value()
    .forEach((resType) => {
      describe(`${resType}()`, () => {

        it('should set the response to be a json object', (done) => {
          express.res.jsonx = function(data) {
            expect(data).to.be.an('object');
            return this;
          };

          express[resType]('bad request, yo!');
          done();
        });

        it('error messages and codes should be overridable', (done) => {
          const responseData = {
            message: 'You can\'t do that',
            code: 666,
          };

          express.res.jsonx = function(data) {
            expect(data.message).to.equal(responseData.message);
            expect(data.code).to.equal(responseData.code);
            return this;
          };

          express[resType]({}, responseData);
          done();
        });
      });
    });
});

