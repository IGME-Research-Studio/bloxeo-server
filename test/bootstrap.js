// configuration for testing purposes
process.env.NODE_ENV = 'test';
const testConfig = require('../config/env/test.js');

const Sails = require('sails');
const supertest = require('supertest');

const options = {
  loose: 'all',
  stage: 2,
  ignore: null,
  only: null,
  extensions: null,
};

global.babel = require('sails-hook-babel/node_modules/babel/register')(options);

/**
* Global function to send request
* @param method
* @param url
* @returns {*}
*/
function request(method, url) {
  return supertest(sails.hooks.http.app)[method](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

before(function(done) {
  this.timeout(10000);
  Sails.lift(testConfig, function(error, server) {
    if (error) return done(error);

    const sails = server;
    sails.requestForTest = request;

    // here you can load fixtures, etc.
    done(error, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});

