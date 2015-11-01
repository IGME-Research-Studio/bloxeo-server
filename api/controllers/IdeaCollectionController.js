/**
 * IdeaCollectionController
 *
 * @description :: Server-side logic for managing ideaCollections
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const boardService = require('../services/BoardService.js');
const ideaCollectionService = require('../services/IdeaCollectionService.js');
const promise = require('bluebird');

module.exports = {
  /**
  * route for creating a new IdeaCollection
  * @todo: optionally add an idea on creation
  */
  create: function(req, res) {
    // check for required parameters
    if (!req.param('boardId') || !req.body.idea || !req.body.user ) {
      return res.json(400, {message: 'Not all required parameters were supplied'});
    }

    const boardId = req.param('boardId');

    // Create an IdeaCollection
    ideaCollectionService.create(req.body.idea, req.body.user, boardId)
      .then(function(collectionIndex) {
        // Inform all clients a new collection has been added to the board
        sails.sockets.broadcast(boardId, 'AddedCollection', {index: collectionIndex, content: ideaCollectionService.getAllIdeas()});

        return res.json(200, { index: index, content: content });
      })
      .catch(function(err) {
        return res.json(500, {message: 'Problem creating the ideaCollection. ' + err});
      });
  },

  // route for adding an idea to a collection
  addIdea: function(req, res) {
    // check for required parameters
    // if (!req.param('boardId') || !req.body.idea || !req.body.user || !req.body.index) {
    if (!req.param('boardId') || !req.body.idea || !req.body.user || !req.params('index')) {
      return res.json(400, {message: 'Not all required parameters were supplied'});
    }

    // const index = req.body.index; // index of the ideaCollection to add an idea to
    const index = req.param('index');
    const boardId = req.param('boardId');

    // Add the idea to a collection
    ideaCollectionService.addIdea(boardId, index, req.body.idea, req.body.user)
      .then(function() {
        return ideaCollectionService.getAllIdeas(boardId, index);
      })
      .then(function(contents) {
        // Inform all klients of the updated collection
        sails.sockets.broadcast(boardId, 'UpdatedCollection', {index: index, content: contents});
        return res.json(200, {index: index, content: content});
      })
      .catch(function(err) {
        return res.json(500, {message: 'Problem adding to the ideaCollection. ' + err});
      });
  },

  // route for remove an idea to a collection
  removeIdea: function(req, res) {
    // check for required parameters
    // if (!req.param('boardId') || !req.body.idea || !req.body.user || !req.body.index) {
    if (!req.param('boardId') || !req.body.idea || !req.body.user || !req.params('index')) {
      return res.json(400, {message: 'Not all required parameters were supplied'});
    }

    // const index = req.body.index; // index of the ideaCollection
    const index = req.param('index');
    const boardId = req.param('boardId');

    // removethe idea to a collection
    ideaCollectionService.removeIdea(boardId, index, req.body.idea, req.body.user)
      .then(function() {
        return ideaCollectionService.getAllIdeas(boardId, index);
      })
      .then(function(contents) {
        // Inform all klients of the updated collection
        sails.sockets.broadcast(boardId, 'UpdatedCollection', {index: index, content: contents});
        return res.json(200, {index: index, content: content});
      })
      .catch(function(err) {
        return res.json(500, {message: 'Problem removing from the ideaCollection. ' + err});
      });
  },

  // Remove an IdeaCollection from a Board and delete it
  remove: function(req, res) {
    // check for required parameters
    if (!req.param('boardId') || !req.body.user || !req.body.index) {
      return res.json(400, {message: 'Not all required parameters were supplied'});
    }

    const boardId = req.param('boardId');
    const index = req.body.index;

    // Destroy the ideaCollection
    ideaCollectionService.destroy(boardId, index, req.body.user)
      .then(function() {
        // notify all clients that a collection was removed
        sails.sockets.broadcast(boardId, 'RemovedCollection', {index: index});
        res.json(200, {index: index });
      }).catch(function(err) {
        res.json(500, {message: 'Problem removing from the ideaCollection. ' + err});
      });
  },

  // Get all collections in a klient readable format. ex: [{index: i, conent: c}]
  getCollections: function(req, res) {
    // check for required parameters
    if (!req.param('boardId')) {
      return res.json(400, {message: 'Not all required parameters were supplied'});
    }

    const boardId = req.param('boardId');

    boardService.getIdeaCollections(boardId)
      .then(function(collections) {
        const collectionsJSON = [];
        const promises = [];

        function getAllIdeas() {

          return IdeaCollectionService.getAllIdeas();
        }

        function addToCollectionsJSON(content) {

          collectionsJSON.push({
            index: i,
            content: content,
          });
        }

        for (let i = 0; i < collections.length; i++) {

          const p = promise(getAllIdeas())

          .then(addToCollectionsJSON(content));

          promises.push(p);
        }
        Promise.all(promises).then(function() {
          sails.sockets.broadcast(boardId, 'allCollections', collectionsJSON);
          res.json(200, { collections });
        });
      })
      .catch(function(err) {
        res.json(500, {message: 'Failed to get all collections' + err});
      });
  },

  // move all non-duplicate ideas from one collection to another, destroy second collection
  merge: function(req, res) {
    return res.json(500, {message: 'function not implemented'});
  },
};
