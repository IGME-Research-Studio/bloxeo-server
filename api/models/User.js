/**
* User.js
*
* @description :: Model for storing users
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const HashService = require('../services/HashService');

module.exports = {

  schema: true,

  attributes: {

    isFullAccount: {

      type: 'boolean',
      required: true,
    },

    username: {

      type: 'string',
      alphanumericdashed: true,
    },

    password: {

      type: 'string',
    },

    email: {

      type: 'email',
      unique: true,
    },

    firstName: {

      type: 'string',
      defaultsTo: '',
    },

    lastName: {

      type: 'string',
      defaultsTo: '',
    },

    socialProfiles: {

      type: 'object',
      defaultsTo: {},
    },

    rooms: {

      collection: 'room',
      via: 'users',
    },

    ideas: {

      collection: 'idea',
      via: 'user',
    },

    // When returning JSON don't include users password or social profiles
    toJSON: function() {
      const obj = this.toObject;

      delete obj.password;
      delete obj.socialProfiles;

      return obj;
    },
  },

  beforeUpdate: function(values, next) {
    const id = values.id;
    const password = values.password;

    if (id && password) {
      return User
        .findOne({id: id})
        .then(user => {
          if (password === user.password) {
            return next();
          }
          else {
            values.password = HashService.bcrypt.hashSync(password);
            return next();
          }
        })
        .catch(next);
    }
    else {
      next();
    }
  },

  beforeCreate: function(values, next) {
    values.password = HashService.bcrypt.hashSync(values.password);
    next();
  },
};

