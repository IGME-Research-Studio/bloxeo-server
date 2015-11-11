const BoardService = require('../services/BoardService.js');
const ideaCollectionService = {};

/**
  Create an IdeaCollection and add an inital idea
  @param {String} boardId
  @param {int} userId - Id of the User who create the collection
  @param {int} ideaId - Id of an inital Idea to add to the collection
  @returns {Promise} resolves to the last index
*/
// ideaCollectionService.create = function(boardId, userId, ideaId) {
ideaCollectionService.create = function(boardId, ideaContent) {
  return BoardService.findIdeaByContent(boardId, ideaContent)
    .then(function(idea) {

      if (idea === undefined) {
        throw new Error('Idea with content: `' + ideaContent + '` was undefined. Idea collection was not created.');
      }

      // Create and return a new IdeaCollection
      return [
        IdeaCollection.create({
          ideas: [idea.id],
          votes: 0,
          draggable: true,
          // lastUpdated: userId,
        }),
      ];
    })
    .spread(function(collection) {

      // Add IdeaCollection to a Board
      return BoardService.addTo('ideaCollections', boardId, collection.id);
    })
    .then(function() {
      return BoardService.findBoardAndPopulate(boardId, 'ideaCollections');
    })
    .then(function(board) {

      // return the index of the new collection in the board
      return board.ideaCollections.length - 1;
    })
    .catch(function(err) {
      throw err;
    });
};

/**
  Add an Idea to an Idea collection
  @param {String} boardId
  @param {int} index - Index of IdeaCollection to add an Idea from
  @param {String} ideaContent - The content of an Idea to add
  @param {int} userId - Id of the User who added the idea
  @note Potentially want to add a userId to parameters track who created the idea later
*/
ideaCollectionService.addIdea = function(boardId, index, ideaContent) {

  return ideaCollectionService.findAndPopulate(boardId, index)
    .then(function(collection) {
      return [BoardService.findIdeaByContent(boardId, ideaContent), collection];
    })
    .spread(function(idea, collection) {
      if (idea === undefined) {
        throw new Error('Idea with content: `' + ideaContent + '` was undefined and was not added to the idea collection');
      }

      collection.ideas.add(idea.id);
      // save and return the collection
      return collection.save()
        .then((res) => {
          return res;
        })
        .catch(function(err) {
          throw err;
        });
    });
};

/**
  Remove an Idea from an Idea collection
  @param {String} boardId
  @param {int} index - Index of IdeaCollection to remove an Idea from
  @param {String} ideaContent - The content of an Idea to remove
  @param {int} userId - Id of the User who removed the idea

  @note Potentially want to add a userId to parameters track who created
  the idea
*/
ideaCollectionService.removeIdea = function(boardId, index, ideaContent) {

  return ideaCollectionService.findAndPopulate(boardId, index)
    .then(function(collection) {
      return [collection, BoardService.findIdeaByContent(boardId, ideaContent)];
    })
    .spread(function(collection, idea) {

      if (idea === undefined) {
        throw new Error('Idea with content: `' + ideaContent + '` was undefined and not removed from the idea collection');
      }

      const ideaId = idea.id;
      const ideaCollectionCount = collection.ideas.length;

      collection.ideas.remove(ideaId);
      return collection.save()
        .then((res) => {

          // If an idea wasn't removed from an idea collection, then assume that idea wasn't in the idea collection
          if (ideaCollectionCount === res.ideas.length) {

            throw new Error('Idea with content: `' + ideaContent + '` was not in the idea collection');
          }
          return res;
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch(function(err) {
      throw err;
    });
};

/**
  Remove an IdeaCollection from a board then delete the model
  @note Potentially want to add a userId to parameters track who destroyed the
  idea collection model
*/
ideaCollectionService.destroy = function(boardId, index) {

  return BoardService.findBoardAndPopulate(boardId, 'ideaCollections')
    .then(function(board) {
      const id = board.ideaCollections[index].id;
      return [BoardService.removeFrom('ideaCollections', boardId, id), id];
    })
    .spread(function(board, id) {
      return IdeaCollection.destroy(id);
    })
    .catch(function(err) {
      throw new Error(err);
    });
};

/**
  Find and populate an IdeaCollection
*/
ideaCollectionService.findAndPopulate = function(boardId, index) {
  // find a board and populate its ideaCollections
  return BoardService.findBoardAndPopulate(boardId, 'ideaCollections')
    .then(function(board) {

      // find a collection on the board and populate its Ideas
      return IdeaCollection
              .findOne({id: board.ideaCollections[index].id})
              .populate('ideas'); // indexing issue, get idea collection's actual index
    })
    .catch(function(err) {
      throw new Error(err);
    });
};

/**
  Returns the content of each idea in an IdeaCollection
*/
ideaCollectionService.getAllIdeas = function(boardId, index) {

  return ideaCollectionService.findAndPopulate(boardId, index)
    .then(function(ideaCollection) {
      const ideaContents = [];

      ideaCollection.ideas.forEach(function(idea) {
        ideaContents.push(idea.content);
      });
      return ideaContents;
    });
};

module.exports = ideaCollectionService;
