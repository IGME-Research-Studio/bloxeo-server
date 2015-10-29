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
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an idea collection to the board
boardService.addIdeaCollection = function(boardId, ideaCollectionId) {

  return boardService.findBoardAndPopulate(boardId, 'collections')

  .then(function(found) {

    found.collections.add(ideaCollectionId);

    return found.save();
  })
  .catch((err) => {

    throw new Error(err);
  });
};

// Remove an idea collection from the board
boardService.removeIdeaCollection = function(boardId, ideaCollectionId) {

  return boardService.findBoardAndPopulate(boardId, 'collections')

  .then(function(found) {

    found.collections.remove(ideaCollectionId);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Return all idea collections for a board
// @Note Does not populate User objects on Idea objects in a collection
boardService.getIdeaCollections = function(boardId) {
  return Board.findOne({boardId: boardId})
    .populate('collections')
    .then(function(board) {
      return board.collections;
    }).then(function(allCollections) {
      const collections = [];
      const collectionPromises = [];

      allCollections.forEach(function(collection) {

        collectionPromises.push( IdeaCollection.findOne({id: collection.id}).populate('ideas').then(function(ideaCollection) {
          collections.push(ideaCollection);
        })
      );

      });

      return Promise.all(collectionPromises).then(function() {
        return collections;
      });
    });
};


// Find a board
boardService.findBoard = function(boardId) {

  return Board.findOne({boardId: boardId});
};

// Find and populate a board with collection string
boardService.findBoardAndPopulate = function(boardId, collection) {

  return Board.findOne({boardId: boardId}).populate(collection);
};

module.exports = boardService;
