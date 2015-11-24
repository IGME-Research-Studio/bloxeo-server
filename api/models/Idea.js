/**
* Idea - content is unique to a board
* @file
* @TODO validate content&boardId combination is unique
* @TODO Post remove - delete idea from any collections that may contain it
*/

import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  // Which board the idea belongs to
  boardId: {
    type: String,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // Who created the idea, used for color coding the ideas
  user: {
    type: mongoose.Schema.ObjectId,
    // required: true,
    ref: 'User',
  },

  // @TODO 'notRegex: /^\s*$/,' from waterline Idea model, need to convert
  content: {
    type: String,
    required: true,
    trim: true,
  },
});

// Middleware
schema.pre('save', function(next) {
  const self = this;

  // Determine that the boardId & content combination is unique
  this.constructor.find({boardId: this.boardId, content: this.content})
  .then( (results) => {
    if (results.length > 0 && results[0].id !== this.id) {
      self.invalidate('content', 'content must be unique to a Board');
      next(new Error('content must be unique'));
    }
    else {
      next();
    }
  });
});

schema.statics.findOnBoard = function(boardId) {
  return this.find({boardId: boardId})
  .select('content -_id')
  .exec();
};

export { schema };
export const model = mongoose.model('Idea', schema);
