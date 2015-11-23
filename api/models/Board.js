/**
* Board.js
*/

const shortid = require('shortid');
const mongoose = require('mongoose');
const IdeaCollection = require('./IdeaCollection.js');
const Idea = require('./Idea.js');

const schema = new mongoose.Schema({
  isPublic: {
    type: Boolean,
    default: true,
  },

  boardId: {
    type: String,
    unique: true,
    default: shortid.generate,
  },

  name: {
    type: String,
    trim: true,
  },

  users: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],

  admins: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],

  pendingUsers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

schema.post('remove', function(next) {
  // @TODO remove from cache

  // Remove all models that depend on the removed Board
  IdeaCollection.model.remove({boardId: this.boardId})
  .then(() => Idea.model.remove({boardId: this.boardId}))
  .then(() => next());

  next();
});

module.exports.schema = schema;
module.exports.model = mongoose.model('Board', schema);
