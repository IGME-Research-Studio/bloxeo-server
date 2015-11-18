/**
* IdeaCollectionController
*
* @description :: Server-side logic for managing ideaCollections
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

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
    const top = req.body.top;
    const left = req.body.left;

    if (valid.isNull(boardId) || valid.isNull(content) || valid.isNull(top) || valid.isNull(left)) {
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
            {index: collectionIndex, content: ideaStrings, top: top, left: left});

        return res.ok({index: collectionIndex, content: ideaStrings, top: top, left: left});
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
      .then(function(returned) {

        // if there are no more ideas, destroy the collection
        // return undefined
        // otherwise continue normally
        if (returned.ideas.length < 1) {

          IdeaCollectionService.destroy(boardId, index);
          return undefined;
        }
        else {

          return IdeaCollectionService.getAllIdeas(boardId, index);
        }
      })
      .then(function(contents) {

        if (contents === undefined) {

          sails.sockets.broadcast(boardId, EVENT_API.REMOVED_COLLECTION, {index: index});
          return res.ok({index: index});
        }

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

    BoardService.workspaceToClient(boardId, 'getWorkspace', 'index')
      .then(function(collections) {
        res.ok(collections);
      })
      .catch(function(err) {
        res.serverError({message: 'Failed to get all collections' + err});
      });
  },

  getResults: function(req, res) {
    const boardId = req.param('boardId');

    if (valid.isNull(boardId)) {
      return res.json(400,
        {message: 'Not all required parameters were supplied'});
    }

    BoardService.workspaceToClient(boardId, 'getIdeaCollections', 'votes')
    .then(function(collections) {
      BoardService.findBoard(boardId)
      .then(function(board) {
        res.ok({results: collections.reverse(), limit: board.resultsLimit});
      });
    })
    .catch(function(err) {
      res.serverError({message: 'Failed to get results ' + err});
    });
  },

  // move all non-duplicate ideas from one collection to another, destroy second collection
  merge: function(req, res) {
    return res.serverError({message: 'function not implemented'});
  },
};
