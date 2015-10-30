const boardService = require('../services/BoardService.js');
const ideaCollectionService = {};

ideaCollectionService.create = function(ideaContent, userId, boardId) {
  // pass in idea, and user
  return Board.findOne({boardId: boardId}).populate('ideas').then(function(board) {
    for (let i = 0; i < board.ideas.length; i++) {
      if (board.ideas[i].content === ideaContent) {
        return IdeaCollection.create({ideas: [board.ideas[i].id], votes: 0, draggable: true, lastUpdated: userId});
      }
    }
    throw new Error('Idea does not exist');
  }).catch(function(err) {
    throw new Error(err);
  });
};

ideaCollectionService.add = function(boardId, index, ideaContent, userId) {
  console.log(userId);
  return Board.findOne({boardId: boardId}).populate('ideas').then(function(board) {
    let ideaId = null;
    for (let i = 0; i < board.ideas.length; i++) {
      if (board.ideas[i].content === ideaContent) {
        ideaId = board.ideas[i].id;
      }
    }
    return ideaCollectionService.findAndPopulate(boardId, index)
    .then(function(ideaCollection) {
      if (ideaId === null) {
        throw new Error('Idea does not exist in room.');
      }
      ideaCollection.ideas.add(ideaId);
      return ideaCollection.save();

    }).catch(function(err) {
      throw new Error(err);
    });
  });
};

ideaCollectionService.remove = function(boardId, index, ideaContent, userId) {
  console.log(userId);
  return ideaCollectionService.findAndPopulate(boardId, index)
  .then(function(ideaCollection) {
    for (let i = 0; i < ideaCollection.ideas.length; i++) {
      if (ideaCollection.ideas[i].content === ideaContent) {
        // also needs to update lastUpdated, does this need another then/catch?
        ideaCollection.ideas.remove(ideaId);
        return ideaCollection.save();
      }
    }
  }).catch(function(err) {
    throw new Error(err);
  });
};

ideaCollectionService.merge = function() {

};

ideaCollectionService.destroy = function(boardId, index) {
  return boardService.findAndPopulate(boardId, 'ideaCollections')
    .then(function(board) {
      const ideaCollectionId = board.ideaCollections[index];
      board.ideaCollections.remove(ideaCollectionId);
      return IdeaCollection.destroy(ideaCollectionId);
    }).catch(function(err) {
      throw new Error(err);
    });
};

ideaCollectionService.findAndPopulate = function(boardId, index) {
  return boardService.findBoardAndPopulate(boardId, 'ideaCollections')
    .then(function(board) {
      return IdeaCollection.findOne({id: board.ideaCollections[index].id}).populate('ideas');
    }).catch(function(err) {
      throw new Error(err);
    });
};

ideaCollectionService.getAllIdeas = function(boardId, index) {
  return ideaCollectionService.findAndPopulate(boardId, index).then(function(obj) {
    const ideaContents = [];
    for (let i = 0; i < obj.ideas.length; i++) {
      ideaContents.push(obj.ideas[i].content);
    }
    return ideaContents;
  });
};

module.exports = ideaCollectionService;
