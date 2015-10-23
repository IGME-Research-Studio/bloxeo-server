/**
 * IdeaController
 *
 * @description :: Server-side logic for managing ideas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function(req, res) {

    // check for required data
    if (!req.body.user || !req.body.boardId || !req.body.content) {

      // if one of the data requirements are missing, return bad request
      return res.badRequest('Check parameters. Request should send "user, "content" and "boardID"');
    }
    else {

      // if all data is present, find the board
      Board.findOne({boardId: req.body.boardId}).populate('ideas').exec(function(err, board) {

        // if there are any ideas in the board already
        if (board.ideas.length !== 0) {

          // loop through all ideas
          for (let i = 0; i < board.ideas.length; i++) {

            // if an idea has the same content as the one the user wants to create
            if (content.ideas[i].content === req.body.content) {

              // return bad request
              return res.badRequest('Duplicate idea');
            }
          }
        }
      });

      // call create idea service.
      // values in req.body must be "user", "content"
      idea.create(req.body.user, req.body.content).exec(function(err, created) {

        if (err) {

          // failure
          res.json(500, {message: 'Something happened while trying to create an idea. Error: ' + err});
        }
        else {

          // add the idea to the board
          // board.addIdea(req.boardId, created);

          // server console message to show created entry
          // console.log('\nidea created with id:');
          // console.log(idea);

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
        }
      });
    }
  },

  delete: function(req) {

    idea.delete(req.body.ideaID, function(response) {

      console.log(response);
    });
  },
};
