/**
 * ConstantsController
 *
 * @description :: Server-side logic for passing our routes to Klient
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ConstantsService = require('../services/ConstantsService');

module.exports = {
  index: function(req, res) {
    return res.ok(ConstantsService());
  },
};

