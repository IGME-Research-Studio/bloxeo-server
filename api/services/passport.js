/**
* Passport middleware setup
*
* @description :: Use the passport authentication middleware
*
* For more information on the available providers, check out:
* http://passportjs.org/guide/providers/
*/

const _ = require('lodash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token').Strategy;

/**
* Triggers when user authenticates via local strategy
* @param {Object} req Request object
* @param {String} email Email from body field in request
* @param {String} password Password from body field in request
* @param {Function} next Callback
* @private
*/
const _onLocalStrategyAuth = function(req, email, password, next) {
  User
    .findOne({email: email})
    .then(function(user) {
      if (!user) {
        return next(null, null, {
          code: 'E_USER_NOT_FOUND',
          message: email + ' is not found',
        });
      }

      if (!HashService.bcrypt.compareSync(password, user.password)) {
        return next(null, null, {
          code: 'E_WRONG_PASSWORD',
          message: 'Password is wrong',
        });
      }
      return next(null, user, {});
    })
    .catch(next);
};

/**
* Triggers when user authenticates via JWT strategy
* @param {Object} req Request object
* @param {Object} payload Decoded payload from JWT
* @param {Function} next Callback
* @private
*/
const _onJwtStrategyAuth = function(req, payload, next) {
  User
    .findOne({id: payload.id})
    .then(function(user) {
      if (!user) {
        return next(null, null, {
          code: 'E_USER_NOT_FOUND',
          message: 'User with that JWT not found',
        });
      }
      else {
        return next(null, user, {});
      }
    })
    .catch(next);
};

/**
* Triggers when user authenticates via one of social strategies
* @param {Object} req Request object
* @param {String} accessToken Access token from social network
* @param {String} refreshToken Refresh token from social network
* @param {Object} profile Social profile
* @param {Function} next Callback
* @private
*/
const _onSocialStrategyAuth = function(req, accessToken, refreshToken, profile, next) {
  if (!req.user) {
    const criteria = {};
    criteria[`socialProfiles.${profile.provider}.id`] = profile.id;

    const model = {
      username: profile.username || profile.displayName || '',
      email: (profile.emails[0] && profile.emails[0].value) || '',
      firstName: (profile.name && profile.name.givenName) || '',
      lastName: (profile.name && profile.name.familyName) || '',
      socialProfiles: {},
    };
    model.socialProfiles[profile.provider] = profile._json;

    User
      .findOrCreate(criteria, model)
      .then(function(user) {
        if (!user) {
          return next(null, null, {
            code: 'E_AUTH_FAILED',
            message: `${profile.provider} auth failed`,
          });
        }
        return next(null, user, {});
      })
      .catch(next);
  }
  else {
    req.user.socialProfiles[profile.provider] = profile._json;
    req.user.save(next);
  }
};

/**
* Build a new object to pass to `passport.use`
* @param {Function} strategy External Strategy library
* @param {Object} config Configuration object
* @param {Function} cb Callback for after authentication
* @private
*/
const _stratFactory = function(Strategy, config, cb) {
  return new Strategy(_.assign({}, config), cb);
};

/**
* Load all the base strategies, should be called on bootstrap
*/
passport.loadStrategies = function() {
  passport.use(_stratFactory(LocalStrategy,
                             sails.config.passport.LOCAL_STRATEGY_CFG,
                             _onLocalStrategyAuth));
  passport.use(_stratFactory(JwtStrategy,
                             sails.config.passport.JWT_STRATEGY_CFG,
                             _onJwtStrategyAuth));
  passport.use(_stratFactory(FacebookTokenStrategy,
                             sails.config.passport.FB_STRATEGY_CFG,
                             _onSocialStrategyAuth));
  passport.use(_stratFactory(GooglePlusTokenStrategy,
                             sails.config.passport.SOCIAL_STRATEGY_CFG,
                             _onSocialStrategyAuth));
};

module.exports = passport;
