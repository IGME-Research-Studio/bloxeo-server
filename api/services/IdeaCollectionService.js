import { model as IdeaCollection } from '../models/IdeaCollection.js';
import { model as Idea} from '../models/Idea.js';

const ideaCollectionService = {};

/**
 * Create an IdeaCollection and add an initial idea
 * @param {String} boardId
 * @param {String} content - the content of an Idea to create the collection
 * @returns {Promise} resolves to all collection
 */
ideaCollectionService.create = function(boardId, content) {

  return Idea.findOne({boardId: boardId, content: content})
  .then((idea) => new IdeaCollection({boardId: boardId, ideas: [idea.id]}).save())
  .then(() => IdeaCollection.findOnBoard(boardId))
  .catch((err) => {
    throw new Error(err);
  });
};

/**
 * Remove an IdeaCollection from a board then delete the model
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @returns {Promise} - resolves to all collections on the board
 * @todo Potentially want to add a userId to parameters track who destroyed the
 * idea collection model
 */
ideaCollectionService.destroy = function(boardId, key) {

  return IdeaCollection.findByKey(boardId, key)
  .then((collection) => collection.remove())
  .then(() => IdeaCollection.findOnBoard(boardId))
  .catch((err) => {
    throw new Error(err);
  });
};

/**
 * Add an Idea to an Idea collection
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add an Idea to
 * @param {String} content - The content of an Idea to add
 */
ideaCollectionService.addIdea = function(boardId, key, content) {

  return Promise.all([
    IdeaCollection.findByKey(boardId, key),
    Idea.findOne({boardId: boardId, content: content}),
  ])
  .then(([collection, idea]) => {
    collection.ideas.push(idea.id);
    return collection.save();
  })
  .then(() => ideaCollectionService.getAllIdeas(boardId, key))
  .catch((err) => {
    throw new Error(err);
  });
};

/**
 * Remove an Idea from an Idea collection
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @param {String} content - The content of an Idea to remove
 * @returns {Promise} - all ideas in the collection
 */
ideaCollectionService.removeIdea = function(boardId, key, content) {

  return Promise.all([
    IdeaCollection.findByKey(boardId, key),
    Idea.findOne({boardId: boardId, content: content}),
  ])
  .then(([collection, idea]) => {
    collection.ideas.pull(idea.id);
    return collection.save();
  })
  .then(() => ideaCollectionService.getAllIdeas(boardId, key))
  .catch((err) => {
    throw new Error(err);
  });
};

ideaCollectionService.getIdeaCollections = function(boardId) {

  return IdeaCollection.findOnBoard(boardId);
};

/**
 * Returns the content of each idea in an IdeaCollection
 */
ideaCollectionService.getAllIdeas = function(boardId, key) {

  return IdeaCollection.findByKey(boardId, key)
  .then((collection) => collection.ideas );
};

module.exports = ideaCollectionService;
