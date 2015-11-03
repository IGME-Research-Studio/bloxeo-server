const expect = require('chai').expect;

const VersionService = require('../../../api/services/VersionService');

describe('VersionService', () => {
  describe('prefixRoutes', () => {

    it('should give an integer for the apiVersion', (done) => {
      const apiVersion = VersionService.version()
      // no integer type for JS, could write a custom assertion, but meh.
      // main point is that we can get a number out of the JSON config.
      expect(apiVersion).to.be.an('number');
      done();
    });

    it('should prefix the given route', (done) => {
      const someRoute = 'get /someRoute';
      const apiVersion = VersionService.version();
      const output = VersionService.prefixRoute(someRoute);

      expect(output).to.equal('get /v' + apiVersion + '/someRoute');
      done();
    });

    it('should prefix methodless routes', (done) => {
      const someRoute = '/someRoute';
      const apiVersion = VersionService.version();
      const output = VersionService.prefixRoute(someRoute);

      expect(output).to.equal('/v' + apiVersion + '/someRoute');
      done();
    });
  });
});


