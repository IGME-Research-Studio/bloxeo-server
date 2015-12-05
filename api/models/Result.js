/**
* Result - Container for ideas and votes
* @file
*/

import mongoose from 'mongoose';
import shortid from 'shortid';

const schema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    default: shortid.generate,
  },

  // Which board the collection belongs to
  boardId: {
    type: String,
    required: true,
  },

  votes: {
    type: Number,
    default: 0,
    min: 0,
    required: true,
  },

  round: {
    type: Number,
    default: 0,
    min: 0,
    required: true,
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
/**
 * Find a single collections identified by a boardId and collection key
 * @param {String} boardId
 * @param {String} key
 * @returns {Promise} - resolves to a mongo ideaCollection with its ideas
 * populated
 */
schema.statics.findByKey = function(boardId, key) {
  return this.findOne({boardId: boardId, key: key})
  .select('ideas key -_id')
  .populate('ideas', 'content -_id')
  .exec();
};

/**
 * Find all collections associated with a given board
 * @param {String} boardId
 * @returns {Promise} - resolves to a key/value pair of collection keys and
 * collection objects
 */
schema.statics.findOnBoard = function(boardId) {
  return this.find({boardId: boardId})
  .select('ideas key -_id')
  .populate('ideas', 'content -_id')
  .exec();
};

const model = mongoose.model('Result', schema);


module.exports.schema = schema;
module.exports.model = model;
