/**
* BoardController
*
* @description :: Server-side logic for managing rooms
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

const boardService = require('../services/BoardService.js');

module.exports = {

  create: function(req, res) {

    boardService.create(req.body)

    .then(function(created) {

      const boardId = created.boardId;
      if (req.isSocket) sails.sockets.join(req.socket, boardId);

      res.created(created);
    })
    .catch(function(err) {

      res.serverError(err);
    });
  },

  destroy: function(req, res) {

    const boardId = req.param('boardId');

    boardService.destroy(boardId)

    .then(function(deleted) {

      res.ok(deleted);
    })
    .catch(function(err) {

      res.serverError(err);
    });
  },

  join: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.param('boardId');

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    sails.sockets.join(userSocketId, boardId);
    sails.sockets.broadcast(boardId, 'boardJoined', {message: 'User with socket id: ' + userSocketId.id + ' has joined the board!'});

    res.ok({

      message: 'User ' + userSocketId.id + ' subscribed to board with board id: ' + boardId,
    });
  },

  leave: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.param('boardId');

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    res.ok({

      message: 'Server: User with socket id: ' + req.socket.id + ' left board with board id: ' + boardId,
    });

    sails.sockets.leave(userSocketId, boardId);
  },
};
