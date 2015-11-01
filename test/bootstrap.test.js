const Sails = require('sails');
const Barrels = require('barrels');

const options = {
  loose: 'all',
  stage: 2,
  ignore: null,
  only: null,
  extensions: null,
};

global.babel = require('babel/register')(options);

/**
 * Global function to send request
 * @param method
 * @param url
 * @returns Promise
 */
function request(method, url) {
  return supertest(sails.hooks.http.app)[method](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(10000);

  Sails.lift({}, function(err, server) {
    const sails = server;
    sails.superRequest = request;

    if (err) return done(err);

    // here you can load fixtures, etc.
    const barrels = new Barrels();
    fixtures = barrels.data;

    barrels.populate(function() {done(err, sails);});
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  Sails.lower(done);
});

