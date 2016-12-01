/**
* Idea - content is unique to a board
* @file
*/

import mongoose from 'mongoose';
import { model as IdeaCollection } from './IdeaCollection';
import { InvalidDuplicateError } from '../helpers/extendable-error';
import _ from 'lodash';

const schema = new mongoose.Schema({
  // Which board the idea belongs to
  boardId: {
    type: String,
    required: true,
  },

  // Who created the idea, used for color coding the ideas
  userId: {
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

// Remove the idea and remove it from all idea collections on the board too
// @TODO: Figure out what to do about last person to edit the collecitons
schema.pre('remove', function(next) {
  const self = this;
  // Get all of the idea collections on a board and populate their ideas
  // Loop through all of the collections
  // Remove the idea that matches by mongo id from each collection
  IdeaCollection.find({boardId: self.boardId})
  .then((collections) => {
    return _.map(collections, function(collection) {
      _.map(collection.ideas, function(collectionIdeaId) {
        if (String(collectionIdeaId) === self.id) {
          collection.ideas.pull(self.id);
          collection.save()
          .then(() => {
            if (collection.ideas.length === 0) { collection.remove(); }
          });
        }
      });
    });
  })
  .then(() => next());
});

schema.pre('save', function(next) {
  const self = this;

  // Determine that the boardId & content combination is unique
  this.constructor.find({boardId: this.boardId, content: this.content})
  .then( (results) => {
    if (results.length > 0 && results[0].id !== this.id) {
      self.invalidate('content', 'content must be unique to a Board');
      next(new InvalidDuplicateError('Idea content must be unique to a Board'));
    }
    else {
      next();
    }
  });
});

// statics
/**
 * Find a single idea identified by its content string and boardId
 * @param {String} boardId
 * @param {String} content
 * @returns {Promise} - resolves to a single mongoose idea
 */
schema.statics.findByContent = function(boardId, content) {
  return this.findOne({boardId: boardId, content: content})
  .select('content userId')
  .exec();
};

/**
 * Find all ideas associated with a given board
 * @param {String} boardId
 * @returns {Promise} - resolves to an array of idea mongoose objects with just
 * the content and userId properties
 */
schema.statics.findOnBoard = function(boardId) {
  return this.find({boardId: boardId})
  .select('content userId')
  .exec();
};

export { schema };
export const model = mongoose.model('Idea', schema);
