/**
* Idea - content is unique to a board
* @file
*/
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Which board the idea belongs to
  boardId: {
    type: String,
    rquired: true
  },

  // Who created the idea, used for color coding the ideas
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  },

  // @TODO 'notRegex: /^\s*$/,' from waterline Idea model, need to convert
  content:{
    type: String,
    required: true,
    trim: true
  }

});

module.exports.schema = schema;
module.exports.model = mongoose.model('Idea', schema);
