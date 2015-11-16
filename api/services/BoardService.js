// Board Service Functionality
const boardService = {};
const Promise = require('bluebird');

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

boardService.update = function(boardId, updateObj) {
  return Board.findOne({boardId: boardId})
  .then(function(board) {
    return Board.update({boardId: board.boardId}, updateObj);
  });
};

// Return all idea collections for a board
// @note Does not populate User objects on Idea objects in a collection
boardService.getIdeaCollections = function(boardId) {
  return Board.findOne({boardId: boardId})
    .populate('ideaCollections')
    .then(function(board) {
      return board.ideaCollections;
    }).then(function(allCollections) {
      const collections = [];
      const collectionPromises = [];

      allCollections.forEach(function(collection) {

        collectionPromises.push(
          IdeaCollection
            .findOne({id: collection.id})
            .populate('ideas')
            .then((ideaCollection) => collections.push(ideaCollection))
        );
      });

      return Promise.all(collectionPromises).then(function() {
        return collections;
      });
    });
};

boardService.getResults = function(boardId) {
  return boardService.findBoardAndPopulate(boardId, 'ideaCollections')
  .then(function(board) {
    return board.ideaCollections.sort('votes desc');
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
