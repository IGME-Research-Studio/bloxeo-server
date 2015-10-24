// Board Service Functionality
const board = {};

// Create a board in the database
board.create = function(boardObj) {

  return Board.create(boardObj);
};

// Join the socket room
board.join = function() {

};

// Disconnect from the socket room
board.leave = function() {

};

// Remove a board from the database
board.destroy = function(boardId) {

  return Board.destroy({boardId: boardId});
};

// Add a user to the board
board.addUser = function(boardId, userObj) {

  board.findBoardAndPopulate(boardId, 'users')

  .then(function(found) {

    found.users.add(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove a user from the board
board.removeUser = function(boardId, userObj) {

  board.findBoardAndPopulate(boardId, 'users')

  .then(function(found) {

    found.users.remove(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an admin to the board
board.addAdmin = function(boardId, userObj) {

  board.findBoardAndPopulate(boardId, 'admins')

  .then(function(found) {

    found.admins.add(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an admin to the board
board.removeAdmin = function(boardId, userObj) {

  board.findBoardAndPopulate(boardId, 'admins')

  .then(function(found) {

    found.admins.remove(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add a pending user to the board
board.addPendingUser = function(boardId, userObj) {

  board.findBoardAndPopulate(boardId, 'pendingUsers')

  .then(function(found) {

    found.pendingUsers.add(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove a pending user from the board
board.removePendingUser = function(boardId, userObj) {

  board.findBoardAndPopulate(boardId, 'pendingUsers')

  .then(function(found) {

    found.pendingUsers.remove(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an idea to the board
board.addIdea = function(boardId, ideaObj) {

  board.findBoardAndPopulate(boardId, 'ideas')

  .then(function(found) {

    found.ideas.add(ideaObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an idea to the board
board.removeIdea = function(boardId, ideaObj) {

  board.findBoardAndPopulate(boardId, 'ideas')

  .then(function(found) {

    found.ideas.remove(ideaObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an idea collection to the board
board.addIdeaCollection = function(boardId, ideaCollectionObj) {

  board.findBoardAndPopulate(boardId, 'collections')

  .then(function(found) {

    found.collections.add(ideaCollectionObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an idea collection from the board
board.removeIdeaCollection = function(boardId, ideaCollectionObj) {

  board.findBoardAndPopulate(boardId, 'collections')

  .then(function(found) {

    found.collections.remove(ideaCollectionObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Find a board
board.findBoard = function(boardId) {

  return Board.findOne({boardId: boardId});
};

// Find and populate a board with collection string
board.findBoardAndPopulate = function(boardId, collection) {

  return Board.findOne({boardId: boardId}).populate(collection);
};

module.exports = board;
