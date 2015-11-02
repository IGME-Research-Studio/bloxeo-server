/**
* Prefix the routes with configured version number
*
* Needs to read in the config file separately because this may be called
* before configuration has been bootstrapped (e.g. while configuring routes)
*/

const fs = require('fs');
const path = require('path');

const readJSONSync = function(fPath) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, fPath), 'utf8'));
};

const version = readJSONSync('../../.sailsrc').apiVersion;

module.exports = {

  version: function() {
    return version || 1;
  },

  prefix: function() {
    return '/v' + this.version();
  },

  /**
  * Prefix a given route with the current version number (set in .sailsrc)
  *
  * @example
  * prefixRoute('get /people') => 'get /v1/people'
  * prefixRoute('/') => '/v1/'
  */
  prefixRoute: function(route) {
    const req = route.split(' ');
    let urlIndex;

    if (req.length === 1) urlIndex = 0;
    else                  urlIndex = 1;

    req[urlIndex] = this.prefix() + req[urlIndex];
    return req.join(' ');
  },

  /**
  * Lodash routes have spaces
  * @example
  * prefixTemplateRoute('/board/<%= boardId %>') => '/v1/board/<%= boardId %>'
  */
  prefixTemplateRoute: function(route) {
    return this.prefix() + route;
  },
};
