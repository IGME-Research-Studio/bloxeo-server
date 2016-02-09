import _ from 'lodash';
import { model as IdeaCollection } from '../models/IdeaCollection';
import ideaService from './IdeaService';
import { isNull } from './ValidatorService';

const self = {};

/**
 * Finds a single IdeaCollection based on boardId and key
 * Differs from the mongoose findByKey method in that it throws a not found
 * error instead of returning null when no collection can be found
 * @param {String} boardId
 * @param {String} key
 * @returns {Promise} resolves to a single collection as a Mongoose
 * result object or rejects with a not found error
 */
self.findByKey = function(boardId, key) {
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
self.create = function(userId, boardId, content) {

  return ideaService.findByContent(boardId, content)
  .then((idea) => new IdeaCollection({lastUpdatedId: userId, boardId: boardId,
                                     ideas: [idea.id]}).save())
  .then((created) => new Promise((fulfill, reject) => {
    self.getIdeaCollections(boardId)
      .then((allCollections) => fulfill([created, allCollections]))
      .catch((err) => reject(err));
  }));
};

// add a collection back to the workspace
// self.createFromResult = function(result) {};

/**
 * Remove an IdeaCollection from a board then delete the model
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @returns {Promise} - resolves to all collections on the board
 * @todo Potentially want to add a userId to parameters track who destroyed the
 * idea collection model
 */
self.destroyByKey = function(boardId, key) {

  return self.findByKey(boardId, key)
  .then((collection) => collection.remove())
  .then(() => self.getIdeaCollections(boardId));
};

/**
 * @param {IdeaCollection} collection - an already found mongoose collection
 * @returns {Promise} - resolves to all the collections on the board
*/
self.destroy = function(boardId, collection) {
  return collection.remove()
  .then(() => self.getIdeaCollections(boardId));
};

/**
 * Dry-out add/remove ideas
 * @param {String} operation - 'ADD', 'add', 'REMOVE', 'remove'
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add or remove an Idea to
 * @param {String} content - The content of an Idea to add or remove
 * @returns {Promise} - resolves to all the collections on the board
 */
self.changeIdeas = function(operation, userId, boardId, key, content) {
  console.log('Inside beginning of changeIdeas.');
  let method;
  if (operation.toLowerCase() === 'add') method = 'push';
  else if (operation.toLowerCase() === 'remove') {
    console.log('inside if statement for remove operation');
    console.log('userId: ' + userId);
    console.log('boardId: ' + boardId);
    console.log('key: ' + key);
    console.log('content: ' + content);
    console.log('operation: ' + operation);
    method = 'pull';
  }
  else throw new Error(`Invalid operation ${operation}`);

  return Promise.all([
    self.findByKey(boardId, key),
    ideaService.findByContent(boardId, content),
  ])
  .then(([collection, idea]) => {
    console.log('Inside then of promise.all in changeIdeas');
    console.log(collection);
    if (operation.toLowerCase() === 'remove' && collection.ideas.length === 1) {
      console.log('Inside changeIdeas before destroying about to be empty collection');
      return self.destroy(collection);
    }
    else {
      console.log('Inside else of then or promise.all');
      collection.ideas[method](idea.id);
      return collection.save()
      .then(() => self.getIdeaCollections(boardId));
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
self.addIdea = function(userId, boardId, key, content) {

  return self.changeIdeas('add', userId, boardId, key, content);
};

/**
 * Remove an Idea from an Idea collection
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @param {String} content - The content of an Idea to remove
 * @returns {Promise} - resolves to all the collections on the board
 */
self.removeIdea = function(userId, boardId, key, content) {
  console.log('Inside removeIdea');
  return self.changeIdeas('remove', userId, boardId, key, content);
};

/**
 * @param {String} boardId
 * @returns {Promise} - resolves to all the collections on the board
 */
self.getIdeaCollections = function(boardId) {

  return IdeaCollection.findOnBoard(boardId)
  .then((collections) => _.indexBy(collections, 'key'));
};

// destroy duplicate collections
self.removeDuplicates = function(boardId) {
  return IdeaCollection.find({boardId: boardId})
  .then((collections) => {
    const dupCollections = [];

    for (let i = 0; i < collections.length - 1; i++) {
      for (let c = i + 1; c < collections.length; c++) {
        if (collections[i].ideas.length === collections[c].ideas.length) {
          const concatArray = (collections[i].ideas.concat(collections[c].ideas));
          const deduped = _.unique(concatArray, String);

          if (deduped.length === collections[i].ideas.length) {
            dupCollections.push(collections[i]);
            break;
          }
        }
      }
    }
    return dupCollections;
  })
  .then((dupCollections) => {
    return _.map(dupCollections, (collection) => {
      return IdeaCollection.remove({key: collection.key, boardId: collection.boardId});
    });
  })
  .all();
};

module.exports = self;
