/**
* Room.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  
  schema: true,

  attributes: {

  	roomID: {

  		type: 'string',
  		required: true,
  		unique: true
  	},

  	uuids: {

  		type: 'array',
  		required: true
  	},

  	ideas: {

  		type: 'array',
  	}
  }
};

