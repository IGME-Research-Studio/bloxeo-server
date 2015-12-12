import _ from 'lodash';
import { model as IdeaCollection } from '../models/IdeaCollection';
import ideaService from './IdeaService';
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
  .then((created) => new Promise((fulfill, reject) => {
    ideaCollectionService.getIdeaCollections(boardId)
      .then((allCollections) => fulfill([created, allCollections]))
      .catch((err) => reject(err));
  }));
};

// add a collection back to the workspace
// ideaCollectionService.createFromResult = function(result) {};

/**
 * Remove an IdeaCollection from a board then delete the model
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @returns {Promise} - resolves to all collections on the board
 * @todo Potentially want to add a userId to parameters track who destroyed the
 * idea collection model
 */
ideaCollectionService.destroyByKey = function(boardId, key) {

  return ideaCollectionService.findByKey(boardId, key)
  .then((collection) => collection.remove())
  .then(() => ideaCollectionService.getIdeaCollections(boardId));
};

/**
 * @param {IdeaCollection} collection - an already found mongoose collection
 * @returns {Promise} - resolves to all the collections on the board
*/
ideaCollectionService.destroy = function(collection) {

  return collection.remove()
  .then(() => ideaCollectionService.getIdeaCollections(boardId))
};

/**
 * Dry-out add/remove ideas
 * @param {String} operation - 'ADD', 'add', 'REMOVE', 'remove'
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add or remove an Idea to
 * @param {String} content - The content of an Idea to add or remove
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.changeIdeas = function(operation, userId, boardId, key, content) {
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
      .then(() => ideaCollectionService.getIdeaCollections(boardId));
    }
  });
};

/**
 * Add an Idea to an Idea collection
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add an Idea to
 * @param {String} content - The content of an Idea to add
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.addIdea = function(userId, boardId, key, content) {

  return ideaCollectionService.changeIdeas('add', userId, boardId, key, content);
};

/**
 * Remove an Idea from an Idea collection
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @param {String} content - The content of an Idea to remove
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.removeIdea = function(userId, boardId, key, content) {

  return ideaCollectionService.changeIdeas('remove', userId, boardId, key, content);
};

/**
 * @param {String} boardId
 * @returns {Promise} - resolves to all the collections on the board
 */
ideaCollectionService.getIdeaCollections = function(boardId) {

  return IdeaCollection.findOnBoard(boardId)
  .then((collections) => _.indexBy(collections, 'key'));
};

// destroy duplicate collections
ideaCollectionService.removeDuplicates = function(boardId) {
  // return remaining collections after removing duplicates
  return IdeaCollection.find({boardId: boardId})
  .then(toClient)
  .then((collections) => {
    const dupCollections = [];

    for (let i = 0; i < collections.length; i++) {
      for (let c = i + 1; c < collections.length; c++) {
        const first = collections[i].ideas.length;
        const second = collections[c].ideas.length;

        if (first === second) {
          const intersect = _.intersection(collections[i].ideas, collections[c].ideas).length;
          if (intersect === first && intersect === second) {
            dupCollections.push(collections[i]);
          }
        }
      }
    }
    return dupCollections;
  })
  .then((dupCollections) => {
    for (let i = 0; i < dupCollections.length; i++) {
      ideaCollectionService.destroy(dupCollections[i]);
    }
    // return remaining collections?
    return ideaCollectionService.getIdeaCollections(boardId);
  });
};

module.exports = ideaCollectionService;
