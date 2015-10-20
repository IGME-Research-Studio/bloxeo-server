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

	Board.findOne({boardId: boardId}).populate('users')

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

	Board.findOne({boardId: boardId}).populate('users')

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

	Board.findOne({boardId: boardId}).populate('admins')

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

	Board.findOne({boardId: boardId}).populate('admins')

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

		Board.findOne({boardId: boardId}).populate('pendingUsers')

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

	Board.findOne({boardId: boardId}).populate('pendingUsers')

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

	Board.findOne({boardId: boardId}).populate('ideas')

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

	Board.findOne({boardId: boardId}).populate('ideas')

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

	Board.findOne({boardId: boardId}).populate('collections').exec(function(err, found) {

		found.collections.add(ideaCollectionObj);

		return found.save();
	});
};

// Remove an idea collection from the board
board.removeIdeaCollection = function(boardId, ideaCollectionObj) {

	Board.findOne({boardId: boardId}).populate('collections').exec(function(err, found) {

		found.collections.remove(ideaCollectionObj);

		return found.save();
	});
};

module.exports = board;
