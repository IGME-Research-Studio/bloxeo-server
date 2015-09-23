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

    uuid: {

      type: 'string',
      required: true,
      unique: true,
    },

    username: {

      type: 'string',
      unique: true,
    },

    password: {

      type: 'string',
    },

    email: {

      type: 'email',
      unique: true,
    },

    rooms: {

      type: 'array',
    },
  },
};

