const validator = require('validator');
const crypto = require('crypto');

/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.register = function(req, res, next) {
  const email = req.param('email');
  const username = req.param('username');
  const password = req.param('password');
  let token;

  if (!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  if (!username) {
    req.flash('error', 'Error.Passport.Username.Missing');
    return next(new Error('No username was entered.'));
  }

  if (!password) {
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  User.create({
    username: username,
    email: email,
  }, function(userCreateErr, user) {
    if (userCreateErr) {
      if (userCreateErr.code === 'E_VALIDATION') {
        if (userCreateErr.invalidAttributes.email) {
          req.flash('error', 'Error.Passport.Email.Exists');
        }
        else {
          req.flash('error', 'Error.Passport.User.Exists');
        }
      }

      return next(userCreateErr);
    }

    // Generating accessToken for API authentication
    token = crypto.randomBytes(48).toString('base64');

    Passport.create({
      protocol: 'local',
      password: password,
      user: user.id,
      accessToken: token,
    }, function(passCreateErr) {
      if (passCreateErr) {
        if (passCreateErr.code === 'E_VALIDATION') {
          req.flash('error', 'Error.Passport.Password.Invalid');
        }

        return user.destroy(function(destroyErr) {
          next(destroyErr || passCreateErr);
        });
      }

      next(null, user);
    });
  });
};

/**
 * Assign local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doens't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.connect = function(req, res, next) {
  const user = req.user;
  const password = req.param('password');

  Passport.findOne({
    protocol: 'local',
    user: user.id,
  }, function(passFindErr, passport) {
    if (passFindErr) { return next(passFindErr); }

    if (!passport) {
      Passport.create({
        protocol: 'local',
        password: password,
        user: user.id,
      }, function(passCreateErr) {
        next(passCreateErr, user);
      });
    }
    else {
      next(null, user);
    }
  });
};

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function(req, identifier, password, next) {
  const isEmail = validator.isEmail(identifier);
  const query = {};

  if (isEmail) {
    query.email = identifier;
  }
  else {
    query.username = identifier;
  }

  User.findOne(query, function(userFindErr, user) {
    if (userFindErr) {
      return next(userFindErr);
    }

    if (!user) {
      if (isEmail) {
        req.flash('error', 'Error.Passport.Email.NotFound');
      }
      else {
        req.flash('error', 'Error.Passport.Username.NotFound');
      }

      return next(null, false);
    }

    Passport.findOne({
      protocol: 'local',
      user: user.id,
    }, function(err, passport) {
      if (passport) {
        passport.validatePassword(password, function(passFindErr, res) {
          if (passFindErr) {
            return next(passFindErr);
          }

          if (!res) {
            req.flash('error', 'Error.Passport.Password.Wrong');
            return next(null, false);
          }
          else {
            return next(null, user);
          }
        });
      }
      else {
        req.flash('error', 'Error.Passport.Password.NotSet');
        return next(null, false);
      }
    });
  });
};
