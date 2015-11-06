/**
* IdeaCollection - Container for ideas
* @file
*/
const mongoose = require('mongoose');

const schema = new mongoose.schema({
  // Which board the collection belongs to
  board: {
    type: mongoose.Schema.ObjectId,
    rquired: true,
    ref: 'Board'
  },

  ideas:[
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Idea'
    }
  ],

  //whether the idea collection is draggable
  draggable:{
    type: Boolean,
    default: true
  },

  // sum of votes recieved
  votes: {
    type: Number,
    default: 0
  },

  // Last user to have modified the collection
  lastUpdated:{
    type: mongoose.Schema.ObjectId,
    ref:'User'
  }
});

module.exports.schema = schema;
module.exports.model = mongoose.model('IdeaCollection', schema);
