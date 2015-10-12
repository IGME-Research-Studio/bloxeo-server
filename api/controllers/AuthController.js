/**
 * Authentication Controller
 *
 * @description Server-side logic for manage user's authorization
 */

const _ = require('lodash');
const passport = require('passport');
const CipherService = require('../services/CipherService');

/**
* Triggers when user authenticates via passport
* TODO: move out of the controller to a service
* @private
*/
function _onPassportAuth(req, res, error, user, info) {
  if (error) return res.serverError(error);
  if (!user) {
    return res.unauthorized(null, {code: info && info.code,
                                   message: info && info.message});
  }

  return res.ok({
    token: CipherService.jwt.encodeSync({id: user.id}),
    user: user,
  });
}

module.exports = {
  /**
  * Sign in by email\password
  */
  signin: function(req, res) {
    passport.authenticate('local', _.partial(_onPassportAuth, req, res))(req, res);
  },

  /**
  * Sign up in system by email\password
  */
  signup: function(req, res) {
    const values = _.omit(req.allParams(), 'id');

    User
      .create(values)
      .then(function(user) {
        sails.log('After create ', user);
        return {
          token: CipherService.jwt.encodeSync({id: user.id}),
          user: user,
        };
      })
      .then(res.created)
      .catch(res.serverError);
  },

  /**
  * Authorization via social networks
  */
  social: function(req, res) {
    const type = req.param('type') ? req.param('type').toLowerCase() : '-';
    // XXX: Fragile technique here...what if the strategy doesn't have this
    // -token naming convention?
    const strategyName = `${type}-token`;

    sails.log.silly(type, strategyName);

    // Potential more readable solution? Think this is what this is supposed to do
    // if (_.has(passport._strategies, strategyName)) {
    if (Object.keys(passport._strategies).indexOf(strategyName) === -1) {
      return res.badRequest(null, {message: `${type} is not supported`});
    }

    // info is also available as third arg
    passport.authenticate('jwt', function(error, user) {
      req.user = user;
      passport.authenticate(strategyName, _.partial(_onPassportAuth, req, res))(req, res);
    })(req, res);
  },

  /**
  * Accept JSON Web Token and updates with new one
  */
  refresh_token: function(req, res) {
    const oldDecoded = CipherService.jwt.decodeSync(req.param('token'));

    res.ok({
      token: CipherService.jwt.encodeSync({id: oldDecoded.id}),
    });
  },
};

