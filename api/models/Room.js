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

    roomId: {

      type: 'string',
    },
    
    isPublic: {

      type: 'boolean',
      required: true,
    },

    admin: {

      model: 'user',
    },

    users: {

      collection: 'user',
    },
    
    whiteList: {

      collection: 'user',
      required: function(){
        return !this.isPublic;
      }
    },

    ideas: {

      collection: 'idea',
    },

    collections: {

      collection: 'ideaCollection',
    },
  },

  beforeCreate: function(model, cb) {
    model.roomId = shortid.generate();
    cb();
  },
};

