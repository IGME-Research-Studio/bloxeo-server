/**
* Board.js
*/

import mongoose from 'mongoose';
import shortid from 'shortid';
import IdeaCollection from './IdeaCollection.js';
import Idea from './Idea.js';
import Result from './Result';

const adminEditables = ['isPublic', 'name', 'description',
                        'userColorsEnabled', 'numResultsShown',
                        'numResultsReturn'];

const schema = new mongoose.Schema({
  isPublic: {
    type: Boolean,
    default: true,
  },

  boardId: {
    type: String,
    unique: true,
    default: shortid.generate,
    adminEditable: false,
  },

  name: {
    type: String,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  userColorsEnabled: {
    type: Boolean,
    default: false,
  },

  numResultsShown: {
    type: Number,
    default: 25,
  },

  numResultsReturn: {
    type: Number,
    default: 5,
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

schema.statics.findBoard = function(boardId) {
  return this.findOne({boardId: boardId});
};

export { schema };
export const adminEditableFields = adminEditables;
export const model = mongoose.model('Board', schema);
