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
    //var barrels = new Barrels();
    
    //keep fixtures var to check against eventually
    //fixtures = barrels.data;
    //console.log(fixtures);
    
    //populate the database with fixtures
    //barrels.populate(function(err){
      done(err, sails);
    //});
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  Sails.lower(done);
});

