/**
 * IdeaController
 *
 * @description :: Server-side logic for managing ideas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ideaService = require('../services/IdeaService.js');
const boardService = require('../services/BoardService.js');

module.exports = {

  create: function(req, res) {

    // check for required data
    if (!req.body.user || !req.body.boardId || !req.body.content) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check create parameters. Request should send "user, "content" and "boardID"');
    }
    else {

      // call create idea service.
      // values in req.body must be "user", "content"
      ideaService.create(req.body.user, req.body.content, req.body.boardId).then(function(created) {

        // add the idea to the board
        boardService.addIdea(req.body.boardId, created);

        // idea contents to send back to the user
        const idea = {

          user: created.user,
          content: created.content,
          id: created.id,
        };

        // emit the idea back through the socket and
        // res.json the idea's id with status 200
        sails.sockets.emit(req.socket.id, 'ideaCreated', idea);
        res.json(200, {message: 'Idea created with id ' + idea.id});

      }).catch(function(err) {

        // failure
        res.json(500, {message: 'Something happened while trying to create an idea. Error: ' + err});
      });
    }
  },

  delete: function(req, res) {

    // check for required data
    if (!req.body.boardId || !req.body.ideaId) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check delete parameters. Request should send "user, "content" and "boardId"');
    }
    else {

      // call delete in the idea service
      ideaService.delete(req.body.boardId, req.body.ideaId).then(function(result) {

        // emit the result
        // res.json the deleted ideas
        sails.sockets.emit(req.socket.id, 'ideaDeleted', {ideaId: result.id, success: true});
        res.json(200, {message: 'Idea deleted with id: ' + result[0].id});

      }).catch(function(err) {

        // res.json the error
        res.json(500, err);
      });
    }
  },
};
