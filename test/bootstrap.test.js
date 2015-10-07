const Sails = require('sails');
var Barrels = require('barrels');

const options = {
  loose: 'all',
  stage: 2,
  ignore: null,
  only: null,
  extensions: null,
};

global.babel = require('sails-hook-babel/node_modules/babel/register')(options);

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(10000);

  Sails.lift({
    // configuration for testing purposes
  }, function(err, server) {
    const sails = server;
    if (err) return done(err);
    // here you can load fixtures, etc.
    var barrels = new Barrels();
    fixtures = barrels.data;

    barrels.populate(function(){done(err, sails);});
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  Sails.lower(done);
});

