/**
 * IdeaController
 *
 * @description :: Server-side logic for managing ideas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ideaService = require('../services/IdeaService.js');
const boardService = require('../services/BoardService.js');
const _ = require('lodash');

module.exports = {

  create: function(req, res) {

    // check for required data
    if (!req.body.user || !req.param('boardId') || !req.body.content) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check create parameters. Request should send "user, "content" and "boardID"');
    }
    else {

      const boardId = req.param('boardId');

      // call create idea service.
      // values in req.body must be "user", "content"
      ideaService.create(req.body.user, req.body.content, boardId).then(function(created) {

        // add the idea to the board
        boardService.addIdea(boardId, created.id).then(function() {

          // find and populate all ideas
          boardService.findBoardAndPopulate(boardId, 'ideas').then(function(board) {

            // extract idea content
            const allIdeas = _.map(board.ideas, 'content');

            // emit the idea back through the socket and
            // res.json the idea's id with status 200
            sails.sockets.broadcast(req.socket.id, 'UPDATED_IDEAS', allIdeas);
            res.json(200, {message: 'Idea created with id ' + created.id, ideaId: created.id});
          })
          .catch(function(err) {

            throw new Error(err);
          });
        })
        .catch(function(err) {

          throw new Error(err);
        });
      }).catch(function(err) {

        // failure
        res.json(500, {message: 'Something happened while trying to create an idea. ' + err});
      });
    }
  },

  delete: function(req, res) {

    // check for required data
    if (!req.param('boardId') || !req.body.ideaId) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check delete parameters. Request should send "boardId" and "ideaId"');
    }
    else {

      const boardId = req.param('boardId');

      // call delete in the idea service
      ideaService.delete(boardId, req.body.ideaId).then(function(result) {

        // find and populate all ideas
        boardService.findBoardAndPopulate(boardId, 'ideas').then(function(board) {

          // extract idea content
          const allIdeas = _.map(board.ideas, 'content');
          // emit the result
          // res.json the deleted ideas
          sails.sockets.broadcast(req.socket.id, 'UPDATED_IDEAS', allIdeas);
          res.json(200, {message: 'Idea deleted with id: ' + result[0].id, ideaId: result[0].id});
        })
        .catch(function(err) {

          throw new Error(err);
        });
      }).catch(function(err) {

        // res.json the error
        res.json(500, err);
      });
    }
  },
};
