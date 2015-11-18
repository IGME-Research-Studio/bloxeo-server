// Board Service Functionality
const boardService = {};
const Promise = require('bluebird');
const _ = require('lodash');

// Create a board in the database
boardService.create = function(boardObj) {

  return Board.create(boardObj);
};

// Remove a board from the database
boardService.destroy = function(boardId) {

  return Board.destroy({boardId: boardId});
};

// find an idea on a board based on content
boardService.findIdeaByContent = function(boardId, content) {

  // find the board
  return Board.findOne({boardId: boardId}).then(function(board) {

    return board.id;
  }).then(function(id) {

    // find idea based on the id returned
    return Idea.findOne({board: id, content: content});
  })
  .catch((err) => {

    throw new Error(err);
  });
};

boardService.addTo = function(attr, boardId, attrId) {
  return boardService.findBoardAndPopulate(boardId, attr)
  .then(function(found) {
    found[attr].add(attrId);

    return found.save();
  })
  .catch((err)=> {
    throw new Error(err);
  });
};

boardService.removeFrom = function(attr, boardId, attrId) {
  return boardService.findBoardAndPopulate(boardId, attr)
  .then(function(found) {
    found[attr].remove(attrId);

    return found.save();
  })
  .catch((err)=> {
    throw new Error(err);
  });
};

// Return all idea collections for a board
// @note Does not populate User objects on Idea objects in a collection
boardService.getIdeaCollections = function(boardId) {
  return Board.findOne({boardId: boardId})
    .populate('ideaCollections')
    .then(function(board) {
      return board.ideaCollections;
    })
    .then(function(allCollections) {

      const collectionPromises = _.map(allCollections, function(collection) {
        return IdeaCollection
          .findOne({id: collection.id})
          .populate('ideas');
      });

      return Promise.all(collectionPromises)
        .then(function(collections) {
          return _.filter(collections, (el) => el !== undefined);
        });
    });
};

boardService.getWorkspace = function(boardId) {
  return boardService.getIdeaCollections(boardId)
    .then((collections) => {
      return _.filter(collections, (collection) => collection.inWorkspace);
    });
};

boardService.workspaceToClient = function(boardId, getMethod, sortBy) {
  return boardService[getMethod](boardId)
    .then((collections) => {
      const mappedCollections = _.map(collections, (collection, i) => {
        const stripped = _.pick(collection, ['votes', 'draggable', 'inWorkspace']);
        stripped.index = i;
        stripped.ideas = _.map(collection.ideas, (idea) => {
          return idea.content;
        });
        return stripped;
      });

      return _.sortBy(mappedCollections, sortBy);
    });
};

boardService.getIdeas = function(boardId) {
  return boardService.findBoardAndPopulate(boardId, 'ideas')
    .then((populatedBoard) => boardService.ideasToClient(populatedBoard))
    .catch((err) => err);
};

/**
* @param {Object} board a board object that has already been populated
* @returns {Array} an ideas array with all non-client-friendly content
* stripped out.
*/
boardService.ideasToClient = function(board) {

  return _.invoke(board.ideas, 'toClient');
};

/**
* Find a board
* @param {string} boardId a boardId (not mongoid)
* @return {Promise} resolves to a single board object
*/
boardService.findBoard = function(boardId) {

  return Board.findOne({boardId: boardId});
};

// Find and populate a board with collection string
boardService.findBoardAndPopulate = function(boardId, collection) {

  return Board.findOne({boardId: boardId}).populate(collection);
};

module.exports = boardService;
