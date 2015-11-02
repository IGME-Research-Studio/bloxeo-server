/**
* IdeaController
*
* @description :: Server-side logic for managing ideas
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
const IdeaService = require('../services/IdeaService.js');
const BoardService = require('../services/BoardService.js');

module.exports = {

  index: function(req, res) {

    if (!req.param('boardId')) {
      return res.badRequest('Request should send "boardId"');
    }

    const boardId = req.param('boardId');

    BoardService.getIdeas(boardId)
      .then((ideas) => res.ok(ideas))
      .catch((err) => res.serverError(err));
  },

  create: function(req, res) {

    // check for required data
    // if (!req.body.user || !req.param('boardId') || !req.body.content) {
    if (!req.param('boardId') || !req.body.content) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check create parameters. Request should send "user, "content" and "board"');
    }

    const boardId = req.param('boardId');

    // call create idea service.
    // values in req.body must be "user", "content"
    IdeaService.create(req.body.user, req.body.content, boardId)
      .then(function(created) {
        // add the idea to the board
        return BoardService.addIdea(boardId, created.id);
      })
      .then(function() {
        // find and populate all ideas
        return BoardService.findBoardAndPopulate(boardId, 'ideas');
      })
      .then(function(board) {
        // extract idea content
        const allIdeas = BoardService.ideasToClient(board);

        // emit the idea back through the socket and
        sails.sockets.broadcast(boardId, 'UpdatedIdeas', allIdeas);
        return res.created(board);
      })
      .catch(function(err) {

        return res.serverError(err);
      });
  },

  destroy: function(req, res) {

    // check for required data
    if (!req.param('boardId') || !req.body.content) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check delete parameters. Request should send "board" and "idea"');
    }

    const boardId = req.param('boardId');
    const ideaContent = req.body.content;

    IdeaService.delete(boardId, ideaContent)
      .then(function() {
        // find and populate all ideas
        return BoardService.findBoardAndPopulate(boardId, 'ideas');
      })
      .then(function(board) {
        // extract idea content
        const allIdeas = BoardService.ideasToClient(board);

        // emit the result
        sails.sockets.broadcast(boardId, 'UPDATED_IDEAS', allIdeas);
        return res.ok(board);
      })
      .catch(function(err) {

        return res.serverError(err);
      });
  },
};
