/**
* Board.js
*/

import mongoose from 'mongoose';
import shortid from 'shortid';
import IdeaCollection from './IdeaCollection.js';
import Idea from './Idea.js';
import Result from './Result';

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

  round: {
    type: Number,
    default: 0,
    min: 0,
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

  // @TODO implement along with private rooms
  // pendingUsers: [
  //   {
  //     type: mongoose.Schema.ObjectId,
  //     ref: 'User',
  //   },
  // ],
});

schema.post('remove', function(next) {
  // @TODO remove from cache

  // Remove all models that depend on the removed Board
  IdeaCollection.model.remove({boardId: this.boardId})
  .then(() => Idea.model.remove({boardId: this.boardId}))
  .then(() => Result.model.remove({boardId: this.boardId}))
  .then(() => next());

  next();
});

export { schema };
export const model = mongoose.model('Board', schema);
