/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function(req, res) {

    const userSocketId = req.socket;

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    Board.create(req.body).exec(function(err, created) {

      const boardId = created.boardId;

      res.json({

        message: 'Server: Board created with board id: ' + boardId,
        boardId: created.boardId,
      });

      sails.sockets.join(userSocketId, boardId);

      // subscribe the user to the room (works)
      Board.subscribe(req, [boardId]);
      Board.publishUpdate(boardId);

      sails.sockets.broadcast(boardId, 'boarJoined', {message: 'User with socket id: ' + userSocketId.id + ' has joined the room!'});
    });
  },

  join: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.body.boardIdentifier;

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    sails.sockets.join(userSocketId, boardId);

    sails.sockets.broadcast(boardId, 'boardJoined', {message: 'User with socket id: ' + userSocketId.id + ' has joined the board!'});

    Board.subscribe(req, [boardId]);

    res.json({

      message: 'User ' + userSocketId.id + ' subscribed to board with board id: ' + boardId,
    });
  },

  leave: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.body.boardIdentifier;

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Request Error: Only a client socket can subscribe to a board.');
    }

    sails.sockets.leave(userSocketId, boardId);

    res.json({

      message: 'Server: User with socket id: ' + userSocketId.id + ' left board with board id: ' + boardId,
    });
  },
};
