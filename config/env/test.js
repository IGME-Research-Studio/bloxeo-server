/**
* Testing environment settings, occurs when NODE_ENV=test
*
* This file can include shared settings for a development team,
* such as API keys or remote database passwords.  If you're using
* a version control solution for your Sails app, this file will
* be committed to your repository unless you add it to your .gitignore
* file.  If your repository will be publicly viewable, don't add
* any private information to this file!
*/

module.exports = {

  models: {
    connection: 'test',
    migrate: 'drop',
  },

  /**
  * Set the port in the testing environment different than the development so
  * that tests can be run simultaneously.
  */
  port: 1338,

  hooks: {
    csrf: false,
    grunt: false,
    i18n: false,
    session: false,
    views: false,
  },

  log: {
    level: 'silent',
  },
};
