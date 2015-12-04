/**
* UserService: contains actions related to users and boards.
*/
const User = require('../models/User');
const tokenService = require('./TokenService');
const userService = {};

// Create a user in the database
// partial stub to test JWT
userService.create = function() {

  const tokenData = {
    'name': 'vader',
  };
  const token = tokenService.generateNewToken(tokenData);

  return token;
};

// Remove a user from the database
// stub
userService.destroy = function(userId) {

  return User.model.remove({userId: userId});
};

module.exports = userService;
