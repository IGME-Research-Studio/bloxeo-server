/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,

  attributes: {

    isFullAccount: {

      type: 'boolean',
      required: true,
    },

    username: {

      type: 'string',
      required: true,
    },

    password: {

      type: 'string',
      required: function() {
        return this.isFullAccount;
      },
    },

    email: {

      type: 'email',
      unique: true,
      required: function() {
        return this.isFullAccount;
      },
    },

  },
};

