/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
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
  local: {
    strategy: require('passport-local').Strategy
  },

  bearer: {
    strategy: require('passport-http-bearer').Strategy
  },
/* leaving out twitter for now, because they require a valid website address for access
  twitter: {
    name: 'Twitter',
    protocol: 'oauth',
    strategy: require('passport-twitter').Strategy,
    options: {
      consumerKey: 'your-consumer-key',
      consumerSecret: 'your-consumer-secret'
    }
  },
*/
  facebook: {
    name: 'Facebook',
    protocol: 'oauth2',
    strategy: require('passport-facebook').Strategy,
    options: {
      clientID: '1617038175185168',
      clientSecret: '42cda5db83836a30978ee8465bbfffd0',
      scope: ['email'] /* email is necessary for login behavior */
    }
  },

  google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: '697577835669-pjh94e0cf5g0t43d2932tj485obgpmcv.apps.googleusercontent.com',
      clientSecret: 'i3RlwVeUJuuM-ZA0oh3cQfpc',
      scope: ['email']
    }
  }
};
