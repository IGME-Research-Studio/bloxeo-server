/**
 * IdeaCollectionController
 *
 * @description :: Server-side logic for managing ideaCollections
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const boardService = require('../services/BoardService.js');
const boardService = require('../services/IdeaCollectionService.js');

module.exports = {
  // should work like a charm. Tested and worked for me
  create: function(req, res) {
    // if not correct info return badreq message
    const boardId = req.param('boardId');

    // call service to create collection ---ACTUAL CODE - be sure to clean up names like "board2"
    ideaCollectionService.create(req.content, req.body.user, boardId)
      .then(function(ideaCollection) {
        // get board and add collection to it
        boardService.addIdeaCollection(boardId, ideaCollection.id)
          .then(function(board) {
.
            const index = board.ideaCollections.length - 1;
            ideaCollectionService.getIdeaContents(board.boardId, index)
              .then(function(content) {
                sails.sockets.broadcast(boardId, 'AddedCollection', {index: index, content: content});

                return res.json(200, {
                  index: index,
                  content: content,
                });
              });
          }).catch(function(err) {
            return res.json(500, {message: 'Problem adding ideaCollection to board. ' + err});
          });
      }).catch(function(err) {
        return res.json(500, {message: 'Problem creating the ideaCollection. ' + err});
      });
  },
  // most recent changes untested, but without the for in service itworked
  add: function(req, res) {
    // update ideaCollection with another idea

    const boardId = req.param.('boardId');
    const index = req.body.index;

    // use the user
    ideaCollectionService.add(boardId, index, req.body.idea, req.body.user)
      .then(function(ideaCollection) {

        ideaCollectionService.getAllIeas(boardId, index)
        .then(function(content) {
          sails.sockets.broadcast(boardId, 'UpdatedCollections', {index: index, content: content});

          return res.json(200, {
            index: index,
            content: content,
          });
        });
      }).catch(function(err) {
        return res.json(500, {message: 'Problem adding to the ideaCollection. ' + err});
      });
  },
  // most recent changes untested, but without the for in service itworked
  remove: function(req, res) {
    // delete ideaCollection and remove from board

    const boardId = req.param('boardId');
    const index = req.body.index;
    // change to use idea content and user
    ideaCollectionService.remove(boardId, index, req.body.idea, req.body.user)
      .then(function(ideaCollection) {
        ideaCollectionService.getAllIdeas(boardId, index)
        .then(function(content) {
          sails.sockets.broadcast(boardId, 'UpdatedCollections', {index: index, content: content});

          res.json(200, {
            index: index,
            content: content,
          });
        });
      }).catch(function(err) {
        res.json(500, {message: 'Problem removing from the ideaCollection. ' + err});
      });
  },
  // untested
  getCollections: function(req, res) {
    const boardId = req.param('boardIdentity');
    boardService.getIdeaCollection(boardId)
      .then(function(found) {
        let ideaCollections = [];
        for (let i = 0; i < found.length; i++) {
          ideaCollectionService.getAllIdeas(boardId, i)
            .then(function(content){
              ideaCollections.push({index: i, content: content});
            });
        }
        sails.sockets.broadcast(boardId, 'getCollections', ideaCollections);

        res.json(200, {
          ideaCollections,
        });
      }).catch(function(err) {
        res.json(500, {message: 'Failed to get all collections' + err});
      });

  },
  // untested
  destroy: function(req, res) {
    // remove ideaCollection from db and board
    const boardId = req.param('boardId');
    ideaCollectionService.destroy(boardId, req.body.index)
      .then(function(destroyed) {
        sails.sockets.broadcast(boardId, 'RemovedCollections', {index: index});

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
