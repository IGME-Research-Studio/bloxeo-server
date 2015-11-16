/**
* BoardController
*
* @description :: Server-side logic for managing rooms
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

const BoardService = require('../services/BoardService.js');
const valid = require('../services/ValidatorService');
const _ = require('lodash');
const EVENT_API = require('../constants/EVENT_API');

module.exports = {

  create: function(req, res) {
    if (valid.isNull(req.body)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    BoardService.create(req.body)
      .then(function(created) {
        const boardId = created.boardId;

        if (req.isSocket) sails.sockets.join(req.socket, boardId);

        // Strip the board mongo result
        const boardStripped =  {
          'isPublic': created.isPublic,
          'boardId': boardId,
        };

        return res.created(boardStripped);
      })
      .catch(function(err) {
        return res.serverError(err);
      });
  },

  update: function(req, res) {
    const boardId = req.param('boardId');

    // how can this be done better?
    // I tried this and it didn't work:
    // _.map(req.body, _.partial(_.ary(_.pick, 4), _, ['hasVoted', 'resultsLimit', 'description', 'name']));
    const updateObj = _.pick(req.body, 'hasVoted');
    updateObj.resultsLimit = _.pick(req.body, 'resultsLimit');
    updateObj.description = _.pick(req.body, 'description');
    updateObj.name = _.pick(req.body, 'name');

    if (valid.isNull(boardId) || valid.isNull(req.body) || valid.isNull(updateObj)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    BoardService.update(boardId, updateObj)
    .then(function(board) {
      sails.sockets.broadcast(boardId, EVENT_API.MODIFIED_BOARD,
                                {board: board});
      return res.ok({board: board});
    });
  },

  destroy: function(req, res) {
    const boardId = req.param('boardId');

    if (valid.isNull(boardId)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    BoardService.destroy(boardId)
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
    if (valid.isNull(req.isSocket)) {
      return res.badRequest(
        {message: 'Only a client socket can subscribe to a room.'});
    }

    sails.sockets.join(userSocketId, boardId);
    sails.sockets.broadcast(boardId, EVENT_API.JOINED_ROOM, {
      message: `User with socket id ${userSocketId.id} joined board ${boardId}`,
    });

    return res.ok({
      message: `User with socket id ${userSocketId.id} joined board ${boardId}`,
    });
  },

  leave: function(req, res) {

    const userSocketId = req.socket;
    const boardId = req.param('boardId');

    // cannot subscribe if the request is not through socket.io
    if (valid.isNull(req.isSocket)) {
      return res.badRequest(
        {message: 'Only a client socket can subscribe to a room.'});
    }

    sails.sockets.leave(userSocketId, boardId);
    sails.sockets.broadcast(boardId, EVENT_API.LEFT_ROOM, {
      message: `User with socket id ${userSocketId.id} left board ${boardId}`,
    });

    return res.ok({
      message: `User with socket id ${userSocketId.id} left board ${boardId}`,
    });
  },
};
