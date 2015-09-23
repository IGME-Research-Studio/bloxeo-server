/*
 * Bearer Authentication Protocol
 *
 * Bearer Authentication is for authorizing API requests. Once
 * a user is created, a token is also generated for that user
 * in its passport. This token can be used to authenticate
 * API requests.
 *
 */

exports.authorize = function(token, done) {
  Passport.findOne({ accessToken: token }, function(passFindErr, passport) {
    if (passFindErr) { return done(passFindErr); }
    if (!passport) { return done(null, false); }

    User.findOneById(passport.user, function(userFindErr, user) {
      if (userFindErr) { return done(userFindErr); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  });
};
