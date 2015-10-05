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
      // required: true,
      // unique: true,
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
      via: 'rooms',
    },

    ideas: {

      collection: 'idea',
      via: 'room',
    },
    
    collections: {
    
      collection: 'ideaCollection',
      via: 'room',
    },
  },

  beforeCreate: function(model, cb) {
    model.roomId = shortid.generate();
    cb();
  },
};

