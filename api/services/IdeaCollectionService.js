const IdeaCollection = require('../models/IdeaCollection.js');
const Idea = require('../models/Idea.js');

const ideaCollectionService = {};

/**
* Create an IdeaCollection and add an inital idea
* @param {String} boardId
* @param {int} userId - Id of the User who create the collection
* @param {int} ideaId - Id of an inital Idea to add to the collection
* @returns {Promise} resolves to the last index
*/
ideaCollectionService.create = function(boardId, content) {

  return Idea.model.findOne({boardId: boardId, content: content})
  .then((idea) => (new IdeaCollection.model({boardId: boardId, ideas: [idea.id]})).save())
  .then((collection) => [collection, IdeaCollection.model.find({boardId: boardId})] )
  .spread((collection, collections) => {
     return {content: collection, index: collections.length-1}
  })
  .catch(function(err) {
    throw new Error(err);
  });
};

ideaCollectionService.getIdeaCollections = function(boardId) {

  return IdeaCollection.model.find({boardId: boardId})
  .select('-_id')
  .populate('ideas', '-_id')
  .exec((collections) => collections);
};

/**
* Add an Idea to an Idea collection
* @param {String} boardId
* @param {int} index - Index of IdeaCollection to add an Idea from
* @param {String} content - The content of an Idea to add
* @param {int} userId - Id of the User who added the idea
*/
ideaCollectionService.addIdea = function(boardId, index, content) {

  return IdeaCollection.model.findByIndex(boardId, index)
  .then((found) => [found, Idea.model.findOne({boardId: boardId, content: content})])
  .spread((collection, idea) => {
    collection.ideas.push(idea.id);
    return collection.save();
  });
};

/**
  Remove an Idea from an Idea collection
  @param {String} boardId
  @param {int} index - Index of IdeaCollection to remove an Idea from
  @param {String} content - The content of an Idea to remove
  @param {int} userId - Id of the User who removed the idea
*/
ideaCollectionService.removeIdea = function(boardId, index, content) {

  return IdeaCollection.model.findByIndex(boardId, index)
  .then((found) => [found, Idea.model.findOne({boardId: boardId, content: content})])
  .spread((collection, idea) => {
    collection.ideas.pull(idea.id);
    return collection.save();
  });
};

/**
  Remove an IdeaCollection from a board then delete the model
  @todo Potentially want to add a userId to parameters track who destroyed the
  idea collection model
*/
ideaCollectionService.destroy = function(boardId, index) {

  return IdeaCollection.schema.findByIndex(boardId, index)
  .then((collection) => collection.remove());
};

/**
  Returns the content of each idea in an IdeaCollection
*/
ideaCollectionService.getAllIdeas = function(boardId, index) {

  return IdeaCollection.model.findByIndex(boardId, index)
  .then((collection) => collection.ideas );
};

module.exports = ideaCollectionService;
