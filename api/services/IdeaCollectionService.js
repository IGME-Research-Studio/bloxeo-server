import _ from 'lodash';
import { model as IdeaCollection } from '../models/IdeaCollection';
import { model as Idea } from '../models/Idea';
import { toClient, errorHandler } from '../services/utils';

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
  .then(() => ideaCollectionService.getIdeaCollections(boardId))
  .catch(errorHandler);
};

// add a collection back to the workspace
ideaCollectionService.createFromResult = function(result) {};

/**
 * Remove an IdeaCollection from a board then delete the model
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @returns {Promise} - resolves to all collections on the board
 * @todo Potentially want to add a userId to parameters track who destroyed the
 * idea collection model
 */
ideaCollectionService.destroy = function(boardId, key) {

  return IdeaCollection.findOne({boardId: boardId, key: key})
  .then((collection) => collection.remove())
  .then(() => ideaCollectionService.getIdeaCollections(boardId))
  .catch(errorHandler);
};

/**
 * Dry-out add/remove ideas
 * @param {String} operation - 'ADD', 'add', 'REMOVE', 'remove'
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add an Idea to
 * @param {String} content - The content of an Idea to add
 * @returns {Promise} - all ideas in the collection
 */
ideaCollectionService.changeIdeas = function(operation, boardId, key, content) {
  let method;
  if (operation.toLowerCase() === 'add') method = 'push';
  else if (operation.toLowerCase() === 'remove') method = 'pull';
  else throw new Error(`Invalid operation ${operation}`);

  return Promise.all([
    IdeaCollection.findOne({boardId: boardId, key: key}),
    Idea.findOne({boardId: boardId, content: content}),
  ])
  .then(([collection, idea]) => {
    collection.ideas[method](idea.id);
    return collection.save();
  })
  .then(() => ideaCollectionService.getAllIdeas(boardId, key))
  .catch(errorHandler);
};

/**
 * Add an Idea to an Idea collection
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add an Idea to
 * @param {String} content - The content of an Idea to add
 * @returns {Promise} - all ideas in the collection
 */
ideaCollectionService.addIdea = function(boardId, key, content) {

  return ideaCollectionService.changeIdeas('add', boardId, key, content);
};

/**
 * Remove an Idea from an Idea collection
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @param {String} content - The content of an Idea to remove
 * @returns {Promise} - all ideas in the collection
 */
ideaCollectionService.removeIdea = function(boardId, key, content) {

  return ideaCollectionService.changeIdeas('remove', boardId, key, content);
};

ideaCollectionService.getIdeaCollections = function(boardId) {

  return IdeaCollection.findOnBoard(boardId)
  .then(toClient)
  .then((collections) => _.indexBy(collections, 'key'))
  .catch(errorHandler);
};

/**
 * Returns the content of each idea in an IdeaCollection
 */
ideaCollectionService.getAllIdeas = function(boardId, key) {

  return IdeaCollection.findByKey(boardId, key)
  .then((collections) => toClient(collections.ideas))
  .catch(errorHandler);
};

// destroy duplicate collections
ideaCollectionService.removeDuplicates = function(boardId, key) {
  // return remaining collections after removing duplicates
};



module.exports = ideaCollectionService;
