/**
* Result - Container for ideas and votes
* @file
*/
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Which board the collection belongs to
  boardId: {
    type: String,
    required: true,
  },

  votes: {
    type: Number,
    default: 0,
    min: 0,
  },

  // archive of ideas in the collection
  ideas: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Idea',
    },
  ],

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

const model = mongoose.model('Result', schema);


module.exports.schema = schema;
module.exports.model = model;
