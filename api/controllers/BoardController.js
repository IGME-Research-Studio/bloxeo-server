/**
  * BoardController
*
  * @description :: Server-side logic for managing rooms
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
  */

const boardService = require('../services/BoardService.js');

module.exports = {

  create: function(req, res) {

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    boardService.create(req.body)

    .then(function(created) {

      const boardId = created.boardId;

      res.json(200, {

        message: 'Server: Board created with board id: ' + boardId,
        boardId: created.boardId,
      });
    })
    .catch(function(err) {

      if (err) {

        res.json(500, {

          message: 'Server: An error occurred: ' + err,
        });
      }
    });
  },

  destroy: function(req, res) {

    const boardId = req.body.boardIdentifier;

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    boardService.destroy(boardId)

    .then(function(deleted) {

      res.json(200, {

        message: 'Server: Board with boardId: ' + deleted.boardId + ' was destroyed.',
      });
    })
    .catch(function(err) {

      if (err) {

        res.json(500, {

          message: 'Server: An error occurred: ' + err,
        });
      }
    });
  },

  join: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.body.boardIdentifier;

    // cannot subscribe if the request is not through socket.io
    if (!isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    sails.sockets.join(userSocketId, boardId);

    sails.sockets.broadcast(boardId, 'boardJoined', {message: 'User with socket id: ' + userSocketId.id + ' has joined the board!'});

    res.json(200, {

      message: 'User ' + userSocketId.id + ' subscribed to board with board id: ' + boardId,
    });
  },

  leave: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.body.boardIdentifier;

    res.json(200, {

      message: 'Server: User with socket id: ' + req.socket.id + ' left board with board id: ' + req.body.boardIdentifier,
    });

    sails.sockets.leave(userSocketId, boardId);
  },

  addUser: function() {

  },

  removeUser: function() {

  },

  addAdmin: function() {

  },

  removeAdmin: function() {

  },

  addPendingUser: function() {

  },

  removePendingUser: function() {

  },

  addIdea: function() {

  },

  removeIdea: function() {

  },

  getUpdatedIdeas: function() {

  },

  addIdeaCollection: function() {

  },

  removeIdeaCollection: function() {

  },
};
