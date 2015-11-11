// Board Service Functionality
const Promise = require('bluebird');
const Board = require('../models/Board');
const boardService = {};

// Create a board in the database
boardService.create = function(boardObj) {

  return Board.create(boardObj);
};

// Remove a board from the database
boardService.destroy = function(boardId) {

  return Board.destroy({boardId: boardId});
};

// Add a user to the board
boardService.addUser = function(boardId, userId) {

  return boardService.findBoardAndPopulate(boardId, 'users')

  .then(function(found) {

    found.users.add(userId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove a user from the board
boardService.removeUser = function(boardId, userId) {

  return boardService.findBoardAndPopulate(boardId, 'users')

  .then(function(found) {

    found.users.remove(userId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an admin to the board
boardService.addAdmin = function(boardId, userId) {

  return boardService.findBoardAndPopulate(boardId, 'admins')

  .then(function(found) {

    found.admins.add(userId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an admin to the board
boardService.removeAdmin = function(boardId, userId) {

  return boardService.findBoardAndPopulate(boardId, 'admins')

  .then(function(found) {

    found.admins.remove(userId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add a pending user to the board
boardService.addPendingUser = function(boardId, userId) {

  return boardService.findBoardAndPopulate(boardId, 'pendingUsers')

  .then(function(found) {

    found.pendingUsers.add(userId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove a pending user from the board
boardService.removePendingUser = function(boardId, userId) {

  return boardService.findBoardAndPopulate(boardId, 'pendingUsers')

  .then(function(found) {

    found.pendingUsers.remove(userId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an idea to the board
boardService.addIdea = function(boardId, ideaId) {

  return boardService.findBoardAndPopulate(boardId, 'ideas')

  .then(function(found) {

    found.ideas.add(ideaId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an idea to the board
boardService.removeIdea = function(boardId, ideaId) {

  return boardService.findBoardAndPopulate(boardId, 'ideas')

  .then(function(found) {

    found.ideas.remove(ideaId);

    return found.save();
  })
  .then((populatedBoard) => {
    return Idea.destroy({id: ideaId})
      .then(() => populatedBoard);
  })
  .catch(function(err) {

    throw new Error(err);
  });
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

// Add an idea collection to the board
boardService.addIdeaCollection = function(boardId, ideaCollectionId) {

  return boardService.findBoardAndPopulate(boardId, 'ideaCollections')

  .then(function(found) {

    found.ideaCollections.add(ideaCollectionId);

    return found.save();
  })
  .catch((err) => {

    throw new Error(err);
  });
};

// Remove an idea collection from the board
boardService.removeIdeaCollection = function(boardId, ideaCollectionId) {

  return boardService.findBoardAndPopulate(boardId, 'ideaCollections')

  .then(function(found) {

    found.ideaCollections.remove(ideaCollectionId);

    return found.save();
  })
  .catch(function(err) {

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
