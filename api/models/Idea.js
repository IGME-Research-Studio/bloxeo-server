/**
* Idea - content is unique to a board
* @file
*/
var mongoose = require('mongoose');

var schema = new mongoose.schema({
  // Which board the idea belongs to
  board: ={
    type: mongoose.Schema.ObjectId,
    rquired: true,
    ref: 'Board'
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

  // Massage data into a client ready format
  toJSON : function(){
    return {content: this.content};
  }
});

module.exports.schema = schema;
module.exports.model = mongoose.model('Idea', schema);
