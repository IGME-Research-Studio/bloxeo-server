/**
* Utilities for various modules as a service.
*/
const _ = require('lodash');

const utilityService = {};

utilityService.project = function(data, columns) {
  return _.map(data, _.partialRight(_.pick, columns));
};

module.exports = utilityService;
