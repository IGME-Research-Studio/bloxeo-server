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
    trim: true,
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

// Middleware Hooks
schema.pre('save', function(next) {

  if (this.isNew) {
    // generate a shortId for boardId
    this.boardId = shortid.generate();

    next();
  }
});

schema.post('remove', function(next) {
  // remove from cache

  // Remove all models that depend on the removed Board
  IdeaCollection.remove({boardId: this.boardId})
  .then(() => Idea.remove({boardId: this.boardId}))
  .then(() => IdeaCollection.remove({boardId: this.boardId}))
  .then(() => next());

  next();
});

module.exports.schema = schema;
module.exports.model = mongoose.model('Board', schema);
