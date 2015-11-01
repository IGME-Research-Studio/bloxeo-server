/**
* Room.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const shortid = require('shortid');

module.exports = {

  schema: true,

  attributes: {

    name: {
      type: 'string',
    },

    boardId: {

      type: 'string',
    },

    isPublic: {

      type: 'boolean',
      required: true,
    },

    admins: {

      collection: 'user',
    },

    users: {

      collection: 'user',
    },

    pendingUsers: {

      collection: 'user',
    },

    ideas: {

      collection: 'idea',
      via: 'board',
    },

    ideaCollections: {

      collection: 'ideaCollection',
      via: 'board',
    },
  },

  beforeCreate: function(model, cb) {
    model.boardId = shortid.generate();
    cb();
  },
};

