/**
* BoardService: contains actions related to users and boards.
*/
const Board = require('../models/Board');
import Redis from './RedisService';
const Promise = require('bluebird');
const boardService = {};
const suffix = '-current-users';

// Create a board in the database
boardService.create = function() {

  const b = new Board.model();
  return b.save().then((result) => result.boardId);
};

// Remove a board from the database
boardService.destroy = function(boardId) {

  return Board.model.remove({boardId: boardId});
};

// find if a board exists
boardService.exists = function(boardId) {
  return Board.model.find({boardId: boardId}).limit(1)
  .then((r) => (r.length > 0) ? true : false);
};

// find users
boardService.getUsers = function(boardId) {
  return Board.model.findOne({boardId: boardId})
  .populate('users', '-_id')
  .exec((board) => board.users);
};

// find admins
boardService.getAdmins = function(boardId) {
  return Board.model.findOne({boardId: boardId})
  .populate('admins', '-_id')
  .exec((board) => board.admins);
};

// find pending users
boardService.getPendingUsers = function(boardId) {
  return Board.model.findOne({boardId: boardId})
  .populate('pendingUsers', '-_id')
  .exec((board) => board.pendingUsers);
};

// add user to currentUsers redis
boardService.join = function(boardId, user) {
  return Redis.sadd(boardId + suffix, user);
};

// remove user from currentUsers redis
boardService.leave = function(boardId, user) {
  return Redis.srem(boardId + suffix, user);
};

// get all currently connected users
boardService.getConnectedUsers = function(boardId) {
  return Redis.smembers(boardId + suffix);
};

boardService.isAdmin = function() {
  return new Promise((res) => {
    res(true);
  });
};

module.exports = boardService;
