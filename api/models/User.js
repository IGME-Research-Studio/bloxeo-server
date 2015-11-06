/**
* User.js
*@file
*/
const mongoose = require('mongoose');
const valid = require('../services/ValidatorService.js');

const schema = new mongoose.Schema({
  isFullAccount:{
    type:Boolean,
    required:true
  },

  username: {
    type: String,
    required:true,
    trim: true,
  },

  password:{
    type: String,
    required: function(){
      return this.isFullAccount;
    },
  },

  email: {
    type: String,
    unique: true,
    required: function(){
      return this.isFullAccount;
    }
  }
});

module.exports.schema = schema;
module.exports.model = mongoose.model('User', schema);
