/**
 * IdeaCollectionController
 *
 * @description :: Server-side logic for managing ideaCollections
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  create: function(req, res) {
    // if not correct info return badreq message
    if (!req.body.user || !req.body.ideaId || !req.body.boardIdentity) {
      return res.badRequest('Incorrect information sent to create ideaCollection');
    }

    const boardId = req.body.boardIdentity;
    // call service to create collection
    ideaCollectionService.create(req.body.ideaId, req.body.user.id)
      .then(function(ideaCollection) {
        // get board and add collection to it
        boardService.addIdeaCollection(boardId, ideaCollection)
          .then(function(board) {

            sails.sockets.broadcast(boardId, 'AddedCollections', {index: board.ideaCollections.length - 1, content: ideaCollection.ideaContentToJSON()});

            res.json(200, {
              index: board.ideaCollections.length - 1,
              content: ideaCollection.ideaContentToJSON(),
            });
          }).catch(function(err) {
            res.json(500, {message: 'Problem adding ideaCollection to board. ' + err});
          });
      }).catch(function(err) {
        res.json(500, {message: 'Problem creating the ideaCollection. ' + err});
      });
  },

  add: function(req, res) {
    // update ideaCollection with another idea
    if (!req.body.user || !req.body.content || !req.body.boardIdentity) {
      return res.badRequest('Incorrect information sent to add to ideaCollection');
    }

    const boardId = req.body.boardIdentity;
    const index = req.body.index;
    // call service to add idea to collection
    ideaCollectionService.add(boardId, index, req.body.ideaId, req.body.user.id)
      .then(function(ideaCollection) {
        sails.sockets.broadcast(boardId, 'UpdatedCollections', {index: index, content: ideaCollection.ideaContentToJSON()});

        res.json(200, {
          index: index,
          content: ideaCollection.ideaContentToJSON(),
        });
      }).catch(function(err) {
        res.json(500, {message: 'Problem adding to the ideaCollection. ' + err});
      });
  },

  remove: function(req, res) {
    // delete ideaCollection and remove from board
    if (!req.body.user || !req.body.content || !req.body.boardIdentity) {
      return res.badRequest('Incorrect information sent to remove from ideaCollection');
    }

    const boardId = req.body.boardIdentity;
    const index = req.body.index;
    // call service to remove idea to collection
    ideaCollectionService.remove(boardId, index, req.body.ideaId, req.body.user.id)
      .then(function(ideaCollection) {
        sails.sockets.broadcast(boardId, 'UpdatedCollections', {index: index, content: ideaCollection.ideaContentToJSON()});

        res.json(200, {
          index: index,
          content: ideaCollection.ideaContentToJSON(),
        });
      }).catch(function(err) {
        res.json(500, {message: 'Problem removing from the ideaCollection. ' + err});
      });
  },

  getCollections: function(req, res) {
    if (!req.body.user || !req.body.boardIdentity) {
      return res.badRequest('Incorrect information sent to get ideaCollections from ideaCollection');
    }

    boardService.getIdeaCollection(req.body.boardIdentity)
      .then(function(ideaCollection) {
        sails.sockets.broadcast(boardId, 'UpdatedCollections', ideaCollections);

        res.json(200, {
          ideaCollections,
        });
      }).catch(function(err) {
        res.json(500, {message: 'Failed to get all collections' + err});
      });

  },

  destroy: function(req, res) {
    // remove ideaCollection from db and board
    if (!req.body.user || !req.body.boardIdentity) {
      return res.badRequest('Incorrect information sent to destroy ideaCollection');
    }

    ideaCollectionService.destroy(req.body.boardIdentifier, req.body.index)
      .then(function(destroyed) {
        sails.sockets.broadcast(boardId, 'UpdatedCollections', {index: index});

        res.json(200, {
          index: index,
        });
      }).catch(function(err) {
        res.json(500, {message: 'Failed to destroy ideaCollection ' + err});
      });
  },

  merge: function(req, res) {
    // move all non-duplicate ideas from one collection to another, destroy second collection
  },
};
