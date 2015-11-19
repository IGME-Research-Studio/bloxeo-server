/**
* Idea - content is unique to a board
* @file
* @TODO validate content&boardId combination is unique
* @TODO Post remove - delete idea from any collections that may contain it
*/
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Which board the idea belongs to
  boardId: {
    type: String,
    rquired: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // Who created the idea, used for color coding the ideas
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },

  // @TODO 'notRegex: /^\s*$/,' from waterline Idea model, need to convert
  content: {
    type: String,
    required: true,
    trim: true,
  },
});

const model =  mongoose.model('Idea', schema);

// Middleware
schema.pre('save', function(next) {
  const self = this;

  // Determine that the boardId & content combination is unique
  this.constructor.find({boardId: this.boardId, content: this.content})
  .then( (results) => {
    if (results.length > 0 && results[0].id !== this.id) {
      self.invalidate('content", "content must be unique to a Board');
      next(new Error('content must be unique'));
    }
    else {
      next();
    }
  });
});


module.exports.schema = schema;
module.exports.model = model;
