/**
* User.js
* @file
*/

const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    trim: true,
  },

  // @todo: implement when private rooms become a thing
  // isFullAccount: {
  //   type: Boolean,
  //   required: true,
  // },
  // password: {
  //   type: String,
  //   required: function() {
  //     return this.isFullAccount;
  //   },
  // },
  //
  // email: {
  //   type: String,
  //   unique: true,
  //   required: function() {
  //     return this.isFullAccount;
  //   },
  // },
});

export { schema };
export const model = mongoose.model('User', schema);
