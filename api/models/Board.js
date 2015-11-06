/**
* Room.js
* @TODO BEFPRE CREATE - generate shortID and set boardId
*/
const shortid = require('shortid');
const mongoose = require('mongoose');
const valid = require('../services/ValidatorService.js');

const schema = new mongoose.schema({
  isPublic: {
    type: Boolean,
    required: true
  },

  boardId:{
    type: String,
    unique: true,
    trim: true
  },

  name:{
    type: String,
    trim: true
  },

  users: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],

  admins: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],

  pendingUsers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]

});

// Middleware Hooks
schema.pre('save', function(next){
  if( this.isNew ){
    // generate a shortId for boardId
    this.boardId = shortid.generate();

    next();
  }
});


module.exports.schema = schema;
module.exports.model = mongoose.model('Board', schema);
