/**
* IdeaCollectionController
*
* @description :: Server-side logic for managing ideaCollections
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

const Promise = require('bluebird');

const BoardService = require('../services/BoardService');
const IdeaCollectionService = require('../services/IdeaCollectionService');
const valid = require('../services/ValidatorService');

const EVENT_API = require('../constants/EVENT_API');

module.exports = {

  /**
  * Controller for creating a new IdeaCollection with an initial, existing idea
  *
  * param boardId
  * body content
  */
  create: function(req, res) {
    const boardId = req.param('boardId');
    const content = req.body.content;

    if (valid.isNull(boardId) || valid.isNull(content)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    IdeaCollectionService.create(boardId, content)
      .then(function(collectionIndex) {

        return [collectionIndex,
                IdeaCollectionService.getAllIdeas(boardId, collectionIndex)];
      })
      .spread(function(collectionIndex, ideaStrings) {

        // Inform all clients a new collection has been added to the board
        sails.sockets.broadcast(boardId, EVENT_API.ADDED_COLLECTION,
            {index: collectionIndex, content: ideaStrings});

        return res.ok({index: collectionIndex, content: ideaStrings});
      })
      .catch(function(err) {
        return res.serverError(
          {message: `Problem creating the ideaCollection. ${err}`});
      });
  },

  /**
  * Controller for for adding an idea to a collection
  *
  * param boardId
  * param index
  * body content
  */
  addIdea: function(req, res) {
    const boardId = req.param('boardId');
    const content = req.body.content;
    const index = req.param('index');

    if (valid.isNull(boardId) || valid.isNull(content) || !valid.isInt(index)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    IdeaCollectionService.addIdea(boardId, index, content)
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


  /**
  * Controller for remove an idea to a collection
  *
  * param boardId
  * param index
  * body content
  */
  removeIdea: function(req, res) {
    const boardId = req.param('boardId');
    const content = req.body.content;
    const index = req.param('index');

    if (valid.isNull(boardId) || valid.isNull(content) || !valid.isInt(index)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

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

  update: function(req, res) {
    const boardId = req.param('boardId');
    const index = req.param('index');
    const updateObj = req.body;

    if (valid.isNull(boardId) || !valid.isInt(index) || valid.isNull(updateObj)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

    IdeaCollectionService.update(boardId, index, updateObj)
    .then(function() {
      return IdeaCollectionService.findAndPopulate(boardId, index);
    })
    .then(function(ideaCollection) {
        // Not actually sure what to pass back?
      sails.sockets.broadcast(boardId, EVENT_API.MODIFIED_COLLECTION,
                                {index: index, ideaCollection: ideaCollection});
      return res.ok({index: index, ideaCollection: ideaCollection});
    })
    .catch(function(err) {
      res.serverError(
        {message: `Problem updating the ideaCollection. ${err}`});
    });

  },

  /**
  * Controller to remove IdeaCollection from a Board and delete it
  *
  * param boardId
  * param index
  */
  destroy: function(req, res) {
    const boardId = req.param('boardId');
    const index = req.body.index;

    if (valid.isNull(boardId) || !valid.isInt(index)) {
      return res.badRequest(
        {message: 'Not all required parameters were supplied'});
    }

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


  /**
  * Controller to get all collections in a klient readable format.
  * e.g. [{index: i, conent: c}, ...]
  *
  * param boardId
  */
  getCollections: function(req, res) {
    const boardId = req.param('boardId');

    if (valid.isNull(boardId)) {
      return res.json(400,
        {message: 'Not all required parameters were supplied'});
    }

    BoardService.getIdeaCollections(boardId)
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
