/**
* IdeaCollection - Container for ideas
* @file
*/
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Which board the collection belongs to
  boardId: {
    type: String,
    rquired: true,
  },

  ideas: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Idea',
    },
  ],

  // whether the idea collection is draggable
  draggable: {
    type: Boolean,
    default: true,
  },

  // sum of votes recieved
  votes: {
    type: Number,
    default: 0,
  },

  // Last user to have modified the collection
  lastUpdated: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

// statics
schema.statics.findByIndex = function(boardId, index) {
  return this.find({boardId: boardId})
  .populate('ideas', 'content -_id')
  .then((collections) => collections[index]);
};

const model = mongoose.model('IdeaCollection', schema);


module.exports.schema = schema;
module.exports.model = model;
