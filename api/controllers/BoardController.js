/**
* BoardController
*
* @description :: Server-side logic for managing rooms
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

const boardService = require('../services/BoardService.js');
const EVENT_API = require('../constants/EVENT_API');

module.exports = {

  create: function(req, res) {

    boardService.create(req.body)

    .then(function(created) {

      const boardId = created.boardId;
      if (req.isSocket) sails.sockets.join(req.socket, boardId);

      return res.created(created);
    })
    .catch(function(err) {

      return res.serverError(err);
    });
  },

  destroy: function(req, res) {

    const boardId = req.param('boardId');

    boardService.destroy(boardId)
      .then(function(deleted) {

        return res.ok(deleted);
      })
      .catch(function(err) {

        return res.serverError(err);
      });
  },

  join: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.param('boardId');

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Only a client socket can subscribe to a room.');
    }

    sails.sockets.join(userSocketId, boardId);
    sails.sockets.broadcast(boardId, EVENT_API.JOINED_ROOM, {
      message: 'User with socket id ${userSocketId.id} joined board ${boardId}`
    });

    return res.ok({
      message: 'User with socket id ${userSocketId.id} joined board ${boardId}`
    });
  },

  leave: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.param('boardId');

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Only a client socket can subscribe to a room.');
    }

    sails.sockets.leave(userSocketId, boardId);
    sails.sockets.broadcast(boardId, EVENT_API.LEFT_ROOM, {
      message: 'User with socket id ${userSocketId.id} left board ${boardId}`
    });

    return res.ok({
      message: 'User with socket id ${userSocketId.id} left board ${boardId}`
    });
  },
};
