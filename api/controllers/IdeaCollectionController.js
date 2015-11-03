/**
 * IdeaCollectionController
 *
 * @description :: Server-side logic for managing ideaCollections
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const Promise = require('bluebird');

const boardService = require('../services/BoardService.js');
const IdeaCollectionService = require('../services/IdeaCollectionService.js');
const EVENT_API = require('../constants/EVENT_API');

module.exports = {
  /**
  * route for creating a new IdeaCollection
  * @todo: optionally add an idea on creation
  */
  create: function(req, res) {
    // check for required parameters
    // if (!req.param('boardId') || !req.body.idea || !req.body.user ) {
    if (!req.param('boardId') || !req.body.content) {
      return res.badRequest({message: 'Not all required parameters were supplied'});
    }

    const boardId = req.param('boardId');

    // Create an IdeaCollection
    // IdeaCollectionService.create(boardId, req.body.user, req.body.idea)
    IdeaCollectionService.create(boardId, req.body.content)
      .then(function(collectionIndex) {

        return IdeaCollectionService.getAllIdeas(boardId, collectionIndex)
          .then(function(ideaStrings) {

            // Inform all clients a new collection has been added to the board
            sails.sockets.broadcast(boardId, EVENT_API.ADDED_COLLECTION,
                {index: collectionIndex, content: ideaStrings});

            return res.ok({index: collectionIndex, content: ideaStrings});
          });
      })
      .catch(function(err) {
        return res.serverError(
          {message: `Problem creating the ideaCollection. ${err}`});
      });
  },

  // route for adding an idea to a collection
  addIdea: function(req, res) {
    // check for required parameters
    // if (!req.params('boardId') || !req.body.content || !req.body.user || !req.body.index) {
    if (!req.param('boardId') || !req.param('index') || !req.body.content) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    // const index = req.body.index;
    // index of the ideaCollection to add an idea to
    const index = req.param('index');
    const boardId = req.param('boardId');

    // Add the idea to a collection
    IdeaCollectionService.addIdea(boardId, index, req.body.content)
      .then(function() {
        return IdeaCollectionService.getAllIdeas(boardId, index);
      })
      .then(function(contents) {
        // Inform all klients of the updated collection
        sails.sockets.broadcast(boardId, EVENT_API.MODIFIED_COLLECTION,
                                {index: index, content: contents});
        return res.ok({index: index, content: contents});
      })
      .catch(function(err) {
        return res.serverError(
          {message: `Problem adding to the ideaCollection. ${err}`});
      });
  },

  // route for remove an idea to a collection
  removeIdea: function(req, res) {
    // check for required parameters
    // if (!req.param('boardId') || !req.body.idea || !req.body.user || !req.body.index) {
    if (!req.param('boardId') || !req.body.content || !req.param('index')) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    // const index = req.body.index; // index of the ideaCollection
    const index = req.param('index');
    const boardId = req.param('boardId');

    // removethe idea to a collection
    // IdeaCollectionService.removeIdea(boardId, index, req.body.content, req.body.user)
    IdeaCollectionService.removeIdea(boardId, index, req.body.content)
      .then(function() {
        return IdeaCollectionService.getAllIdeas(boardId, index);
      })
      .then(function(contents) {
        // Inform all klients of the updated collection
        sails.sockets.broadcast(boardId, EVENT_API.MODIFIED_COLLECTION,
                                {index: index, content: contents});
        return res.ok({index: index, content: contents});
      })
      .catch(function(err) {
        return res.serverError(
          {message: `Problem removing from the ideaCollection. ${err}`});
      });
  },

  // Remove an IdeaCollection from a Board and delete it
  remove: function(req, res) {
    // check for required parameters
    // if (!req.param('boardId') || !req.body.user || !req.body.index) {
    if (!req.param('boardId') || !req.body.index) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    const boardId = req.param('boardId');
    const index = req.body.index;

    // Destroy the ideaCollection
    // IdeaCollectionService.destroy(boardId, index, req.body.user)
    IdeaCollectionService.destroy(boardId, index)
      .then(function() {
        // notify all clients that a collection was removed
        sails.sockets.broadcast(boardId, EVENT_API.REMOVED_COLLECTION,
                                {index: index});
        res.ok({index: index });
      })
      .catch(function(err) {
        res.serverError(
          {message: `Problem removing from the ideaCollection. ${err}`});
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
        let promises;

        function getAllIdeas(indexOfCollection) {

          return IdeaCollectionService.getAllIdeas(boardId, indexOfCollection);
        }

        function addToCollectionsJSON(content, i) {

          collectionsJSON.push({
            index: i,
            content: content,
          });
        }

        promises = _.map(collections, (e, i) => {
          return getAllIdeas(i)
            .then((ideaContent) => {
              return addToCollectionsJSON(ideaContent, i);
            });
        });

        Promise.all(promises).then(function() {
          res.ok(_.sortBy(collectionsJSON, 'index'));
        });
      })
      .catch(function(err) {
        res.serverError({message: 'Failed to get all collections' + err});
      });
  },

  // move all non-duplicate ideas from one collection to another, destroy second collection
  merge: function(req, res) {
    return res.serverError({message: 'function not implemented'});
  },
};
