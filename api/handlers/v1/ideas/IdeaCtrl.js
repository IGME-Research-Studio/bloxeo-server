/**
* IdeaController
*
* @description :: Server-side logic for managing ideas
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
const IdeaService = require('../services/IdeaService');
const BoardService = require('../services/BoardService');
const valid = require('../services/ValidatorService');

const EVENT_API = require('../constants/EVENT_API');

module.exports = {

  index: function(req, res) {
    const boardId = req.param('boardId');

    if (valid.isNull('boardId')) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    BoardService.getIdeas(boardId)
      .then((ideas) => res.ok(ideas))
      .catch((err) => res.serverError(err));
  },

  create: function(req, res) {
    const boardId = req.param('boardId');
    const content = req.body.content;

    if (valid.isNull(boardId) || valid.isNull(content)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    IdeaService.create(req.body.user, content, boardId)
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
        sails.sockets.broadcast(boardId, EVENT_API.UPDATED_IDEAS, allIdeas);
        return res.created(board);
      })
      .catch(function(err) {

        return res.serverError(err);
      });
  },

  destroy: function(req, res) {
    const boardId = req.param('boardId');
    const content = req.body.content;

    if (valid.isNull(boardId) || valid.isNull(content)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    IdeaService.delete(boardId, ideaContent)
      .then(function() {
        // find and populate all ideas
        return BoardService.findBoardAndPopulate(boardId, 'ideas');
      })
      .then(function(board) {
        // extract idea content
        const allIdeas = BoardService.ideasToClient(board);

        // emit the result
        sails.sockets.broadcast(boardId, EVENT_API.UPDATED_IDEAS, allIdeas);
        return res.ok(board);
      })
      .catch(function(err) {

        return res.serverError(err);
      });
  },
};
