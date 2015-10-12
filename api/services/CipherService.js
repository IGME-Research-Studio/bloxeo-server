const ciphers = require('sails-service-cipher');

module.exports = {
  jwt: ciphers('jwt', {
    secretKey: '8e391ce27551a7ab74b2e3d224733b647a4040db77e7dd08875102720f1a7815',
  }),
};
