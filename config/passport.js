/**
* Passport configuration
*
* @description :: Configuration file where you configure your
* passport authentication
*
* I have tested the service with all of the providers listed below - if you
* come across a provider that for some reason doesn't work, feel free to open
* an issue on GitHub.
*
* Also, authentication scopes can be set through the `scope` property.
*
* For more information on the available providers, check out:
* http://passportjs.org/guide/providers/
*/

module.exports.passport = {
  /**
  * Configuration object for local strategy
  * @type {Object}
  * @private
  */
  LOCAL_STRATEGY_CFG: {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true,
  },

  /**
  * Configuration object for JWT strategy
  * @type {Object}
  * @private
  */
  JWT_STRATEGY_CFG: {
    secretOrKey: '8e391ce27551a7ab74b2e3d224733b647a4040db77e7dd08875102720f1a7815',
    tokenBodyField: 'access_token',
    tokenQueryParameterName: 'access_token',
    authScheme: 'Bearer',
    session: false,
    passReqToCallback: true,
  },

  /**
  * Configuration object for social strategies
  * @type {Object}
  * @private
  */
  SOCIAL_STRATEGY_CFG: {
    clientID: '-',
    clientSecret: '-',
    consumerKey: '-',
    consumerSecret: '-',
    passReqToCallback: true,
  },

  /**
  * Configuration object for social strategies
  * @type {Object}
  * @private
  */
  FB_STRATEGY_CFG: {
    clientID: '1617038175185168',
    clientSecret: '42cda5db83836a30978ee8465bbfffd0',
    passReqToCallback: true,
  },
};

