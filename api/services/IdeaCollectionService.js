import _ from 'lodash';
import { model as IdeaCollection } from '../models/IdeaCollection';
import ideaService from './IdeaService';
import { errorHandler } from './utils';
import { isNull } from './ValidatorService';

const ideaCollectionService = {};

/**
 * Finds a single IdeaCollection based on boardId and key
 * Differs from the mongoose findByKey method in that it throws a not found
 * error instead of returning null when no collection can be found
 * @param {String} boardId
 * @param {String} key
 * @returns {Promise} resolves to a single collection as a Mongoose
 * result object or rejects with a not found error
 */
ideaCollectionService.findByKey = function(boardId, key) {
  return IdeaCollection.findByKey(boardId, key)
  .then((collection) => {
    if (isNull(collection)) {
      throw new Error(`IdeaCollection with key ${key} not found on board ${boardId}`);
    }
    else {
      return collection;
    }
  });
};

/**
 * Create an IdeaCollection and add an initial idea
 * @param {String} boardId
 * @param {String} content - the content of an Idea to create the collection
 * @returns {Promise} resolves to all collections on a board
 */
ideaCollectionService.create = function(userId, boardId, content) {

  return ideaService.findByContent(boardId, content)
  .then((idea) => new IdeaCollection({lastUpdatedId: userId, boardId: boardId,
                                     ideas: [idea.id]}).save())
  .then((created) => [created, ideaCollectionService.getIdeaCollections(boardId)])
  .catch(errorHandler);
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

  return ideaCollectionService.findByKey(boardId, key)
  .then((collection) => collection.remove())
  .then(() => ideaCollectionService.getIdeaCollections(boardId))
  .catch(errorHandler);
};

/**
 * Dry-out add/remove ideas
 * @param {String} operation - 'ADD', 'add', 'REMOVE', 'remove'
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add or remove an Idea to
 * @param {String} content - The content of an Idea to add or remove
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.changeIdeas = function(operation, boardId, key, content) {
  let method;
  if (operation.toLowerCase() === 'add') method = 'push';
  else if (operation.toLowerCase() === 'remove') method = 'pull';
  else throw new Error(`Invalid operation ${operation}`);

  return Promise.all([
    ideaCollectionService.findByKey(boardId, key),
    ideaService.findByContent(boardId, content),
  ])
  .then(([collection, idea]) => {
    if (operation.toLowerCase() === 'remove' && collection.ideas.length === 1) {
      return ideaCollectionService.destroy(collection);
    }
    else {
      collection.ideas[method](idea.id);
      return collection.save()
      .then(() => ideaCollectionService.getIdeaCollections(collection.boardId));
    }
  })
  .catch(errorHandler);
};

/**
 * Add an Idea to an Idea collection
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add an Idea to
 * @param {String} content - The content of an Idea to add
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.addIdea = function(boardId, key, content) {

  console.log('Hey add me', boardId, key, content);
  return ideaCollectionService.changeIdeas('add', boardId, key, content);
};

/**
 * Remove an Idea from an Idea collection
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @param {String} content - The content of an Idea to remove
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.removeIdea = function(boardId, key, content) {

  return ideaCollectionService.changeIdeas('remove', boardId, key, content);
};

/**
 * @param {String} boardId
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.getIdeaCollections = function(boardId) {

  return IdeaCollection.findOnBoard(boardId)
  .then((collections) => _.indexBy(collections, 'key'))
  .catch(errorHandler);
};

/**
 * Returns the content of each idea in an IdeaCollection
 * @deprecated
 */
ideaCollectionService.getAllIdeas = function(boardId, key) {

  return ideaCollectionService.findByKey(boardId, key)
  .then((collections) => collections.ideas)
  .catch(errorHandler);
};

module.exports = ideaCollectionService;
