const ideaCollectionService = {};

ideaCollectionService.create = function(ideaId, userId) {
  // pass in idea, and user
  return IdeaCollection.create({ideas: [ideaId], votes: 0, draggable: true, lastUpdated: userId});
};

ideaCollectionService.add = function(boardId, index, ideaId, userId) {
  return ideaCollectionService.findAndPopulate(boardId, index)
  .then(function(ideaCollection) {
    // also needs to update lastUpdated, does this need another then/catch?
    return ideaCollection.ideas.add(ideaId);
  }).catch(function(err) {
    throw new Error(err);
  });
};

ideaCollectionService.remove = function(boardId, index, ideaId, userId) {
  return ideaCollectionService.findAndPopulate(boardId, index)
  .then(function(ideaCollection) {
    // also needs to update lastUpdated, does this need another then/catch?
    return ideaCollection.ideas.remove(ideaId);
  }).catch(function(err) {
    throw new Error(err);
  });
};

ideaCollectionService.merge = function() {

};

ideaCollectionService.destroy = function(boardId, index) {
  return boardService.findAndPopulate(boardId, 'ideaCollections')
    .then(function(board) {
      const ideaColllectionId = board.ideaCollections[index];
      board.ideaCollections.remove(ideaCollectionId);
      return IdeaCollection.destroy(ideaCollectionId);
    }).catch(function(err) {
      throw new Error(err);
    });
};

ideaCollectionService.findAndPopulate = function(boardId, index) {
  return boardService.findAndPopulate(boardId, 'ideaCollections')
    .then(function(board) {
      return board.ideaCollections[index].populate('ideas');
    }).catch(function(err) {
      throw new Error(err);
    });
};


module.exports = ideaCollectionService;
