// Board Service Functionality
const boardService = {};

// Create a board in the database
boardService.create = function(boardObj) {

  return Board.create(boardObj);
};

// Join the socket room
boardService.join = function() {

};

// Disconnect from the socket room
boardService.leave = function() {

};

// Remove a board from the database
boardService.destroy = function(boardId) {

  return Board.destroy({boardId: boardId});
};

// Add a user to the board
boardService.addUser = function(boardId, userObj) {

  boardService.findBoardAndPopulate(boardId, 'users')

  .then(function(found) {

    found.users.add(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove a user from the board
boardService.removeUser = function(boardId, userObj) {

  boardService.findBoardAndPopulate(boardId, 'users')

  .then(function(found) {

    found.users.remove(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an admin to the board
boardService.addAdmin = function(boardId, userObj) {

  boardService.findBoardAndPopulate(boardId, 'admins')

  .then(function(found) {

    found.admins.add(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an admin to the board
boardService.removeAdmin = function(boardId, userObj) {

  boardService.findBoardAndPopulate(boardId, 'admins')

  .then(function(found) {

    found.admins.remove(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add a pending user to the board
boardService.addPendingUser = function(boardId, userObj) {

  boardService.findBoardAndPopulate(boardId, 'pendingUsers')

  .then(function(found) {

    found.pendingUsers.add(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove a pending user from the board
boardService.removePendingUser = function(boardId, userObj) {

  boardService.findBoardAndPopulate(boardId, 'pendingUsers')

  .then(function(found) {

    found.pendingUsers.remove(userObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an idea to the board
boardService.addIdea = function(boardId, ideaObj) {

  boardService.findBoardAndPopulate(boardId, 'ideas')

  .then(function(found) {

    found.ideas.add(ideaObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an idea to the board
boardService.removeIdea = function(boardId, ideaObj) {

  boardService.findBoardAndPopulate(boardId, 'ideas')

  .then(function(found) {

    found.ideas.remove(ideaObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Add an idea collection to the board
boardService.addIdeaCollection = function(boardId, ideaCollectionObj) {

  boardService.findBoardAndPopulate(boardId, 'collections')

  .then(function(found) {

    found.collections.add(ideaCollectionObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
  });
};

// Remove an idea collection from the board
boardService.removeIdeaCollection = function(boardId, ideaCollectionObj) {

  boardService.findBoardAndPopulate(boardId, 'collections')

  .then(function(found) {

    found.collections.remove(ideaCollectionObj);

    return found.save();
  })
  .catch(function(err) {

    throw new Error(err);
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
