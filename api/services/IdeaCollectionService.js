import _ from 'lodash';
import { isNil } from 'ramda';
import { model as IdeaCollection } from '../models/IdeaCollection';
import { findByContent } from './IdeaService';

/**
 * Finds a single IdeaCollection based on boardId and key
 * Differs from the mongoose findByKey method in that it throws a not found
 * error instead of returning null when no collection can be found
 * @param {String} boardId
 * @param {String} key
 * @returns {Promise} resolves to a single collection as a Mongoose
 * result object or rejects with a not found error
 */
export const findByKey = function(boardId, key) {
  return IdeaCollection.findByKey(boardId, key)
  .then((collection) => {
    if (isNil(collection)) {
      throw new Error(`IdeaCollection with key ${key} not found on board ${boardId}`);
    }
    else {
      return collection;
    }
  });
};

/**
 * @param {String} boardId
 * @returns {Promise} - resolves to all the collections on the board
 */
export const getIdeaCollections = function(boardId) {
  return IdeaCollection.findOnBoard(boardId)
  .then((collections) => _.indexBy(collections, 'key'));
};

/**
 * Create an IdeaCollection and add an initial idea
 * @param {String} boardId
 * @param {String} content - the content of an Idea to create the collection
 * @returns {Promise} resolves to all collections on a board
 */
export const create = function(userId, boardId, content) {
  return findByContent(boardId, content)
  .then((idea) => new IdeaCollection({lastUpdatedId: userId, boardId: boardId,
                                     ideas: [idea.id]}).save())
  .then((created) => new Promise((fulfill, reject) => {
    getIdeaCollections(boardId)
      .then((allCollections) => fulfill([created, allCollections]))
      .catch((err) => reject(err));
  }));
};

/**
 * Remove an IdeaCollection from a board then delete the model
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove
 * @returns {Promise} - resolves to all collections on the board
 * @todo Potentially want to add a userId to parameters track who destroyed the
 * idea collection model
 */
export const destroyByKey = function(boardId, key) {
  return findByKey(boardId, key)
  .then((collection) => collection.remove())
  .then(() => getIdeaCollections(boardId));
};

/**
 * @param {IdeaCollection} collection - an already found mongoose collection
 * @returns {Promise} - resolves to all the collections on the board
*/
export const destroy = function(boardId, collection) {
  return collection.remove()
  .then(() => getIdeaCollections(boardId));
};

/**
 * Dry-out add/remove ideas
 * @param {String} operation - 'ADD', 'add', 'REMOVE', 'remove'
 * @param {String} boardId
 * @param {String} key - Key of an IdeaCollection to add or remove an Idea to
 * @param {String} content - The content of an Idea to add or remove
 * @returns {Promise} - resolves to all the collections on the board
 */
export const changeIdeas = function(operation, userId, boardId, key, content) {
  let method;
  if (operation.toLowerCase() === 'add') method = 'push';
  else if (operation.toLowerCase() === 'remove') method = 'pull';
  else throw new Error(`Invalid operation ${operation}`);

  return Promise.all([
    findByKey(boardId, key),
    findByContent(boardId, content),
  ])
  .then(([collection, idea]) => {
    if (operation.toLowerCase() === 'remove' && collection.ideas.length === 1) {
      return destroy(boardId, collection);
    }
    else {
      collection.ideas[method](idea.id);
      return collection.save()
      .then(() => getIdeaCollections(boardId));
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
export const addIdea = function(userId, boardId, key, content) {
  return changeIdeas('add', userId, boardId, key, content);
};

/**
 * Remove an Idea from an Idea collection
 * @param {String} boardId
 * @param {String} key - The key of the collection to remove from
 * @param {String} content - The content of an Idea to remove
 * @returns {Promise} - resolves to all the collections on the board
 */
export const removeIdea = function(userId, boardId, key, content) {
  return changeIdeas('remove', userId, boardId, key, content);
};

// destroy duplicate collections
export const removeDuplicates = function(boardId) {
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
