/**
* BoardService: contains actions related to users and boards.
*/
const Board = require('../models/Board');
const boardService = {};
const Promise = require('bluebird');
const _ = require('lodash');

// Create a board in the database
boardService.create = function(name) {

  const b = new Board.model({name: name});
  return b.save().then((result) => result.boardId);
};

// Remove a board from the database
boardService.destroy = function(boardId) {

  return Board.model.remove({boardId: boardId});
};

/**
 * Add a model to the board
 * @param {String} attr - ('user'|'pendingUser'|'admin')
 * @param {String} boardId
 * @param {String} attrId
 */
boardService.addTo = function(attr, boardId, attrId) {

  return Board.model.find({boardId: boardId})
  .then(function(board) {
    board[attr].add(attrId);
    return board.save();
  })
  .catch(function(err) {
    throw new Error(err);
  });
};

/**
 * Remove a model to the board
 * @param {String} attr - ('user'|'pendingUser'|'admin')
 * @param {String} boardId
 * @param {String} attrId
 */
boardService.removeFrom = function(attr, boardId, attrId) {

  return Board.model.find({boardId: boardId})
  .then(function(board) {
    board[attr].remove(attrId);
    return board.save();
  })
  .catch(function(err) {
    throw new Error(err);
  });
};

// find users
boardService.getUsers = function(boardId) {
  return Board.model.findOne({boardId: boardId})
  .populate('users', '-_id')
  .exec((board) => board.users);
};

// find admins
boardService.getAdmins = function(boardId) {
  return Board.model.findOne({boardId: boardId})
  .populate('admins', '-_id')
  .exec((board) => board.admins);
};

// find pending users
boardService.getPendingUsers = function(boardId) {
  return Board.model.findOne({boardId: boardId})
  .populate('pendingUsers', '-_id')
  .exec((board) => board.pendingUsers);
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

boardService.workspaceToClient = function(boardId) {
  return boardService.getWorkspace(boardId)
    .then((collections) => {
      const mappedCollections = _.map(collections, (collection, i) => {
        const stripped = _.pick(collection, ['votes', 'draggable', 'inWorkspace']);
        stripped.index = i;
        stripped.ideas = _.map(collection.ideas, (idea) => {
          return idea.content;
        });
        return stripped;
      });

      return _.sortBy(mappedCollections, 'index');
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
