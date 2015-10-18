/**
 * IdeaController
 *
 * @description :: Server-side logic for managing ideas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function(req, res) {

    if (!req.body.user || !req.body.boardId || !req.body.content) {

      res.badRequest('Check parameters. Request should send "user, "content" and "boardID"');
    }
    else {

      Board.findOne({boardId: req.boardId}).exec(function found(err, found) {

        console.log('board:');
        console.log(found);
      });
      // call create idea service.
      // values in req.body must be "user", "content"
      idea.create(req.body.user, req.body.content).exec(function(err, created) {

        if (err) {

          // failure
          res.json(500, {messag: 'Something happened while trying to create an idea. Error: ' + err});
        }
        else {

          // idea contents to send back to the user
          const idea = {

            user: created.user,
            content: created.content,
            id: created.id,
          };

          // server console message to show created entry
          console.log('\nidea created with id:');
          console.log(idea);

          sails.sockets.emit(req.socket.id, 'ideaCreated', idea);
          res.json(200, {message: 'Idea created with id ' + idea.id});
        }
      });
    }
  },
/*
  delete: function(req, res) {

    idea.delete(req.body.ideaID, function(response) {

      console.log(response);
    });
  },*/
};
