/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module IdeaService api/services/IdeaService
 */

import { isNil } from 'ramda';
import { model as Idea } from '../models/Idea.js';

const self = {};

// Private
const maybeThrowNotFound = (obj, boardId, content) => {
  if (isNil(obj)) {
    throw new Error(`Idea with content ${content} not found on board ${boardId}`);
  }
  else {
    return obj;
  }
};

/**
 * Create a new Idea
 * @param {String} userId - mongoose id for the user model creating the idea
 * @param {String} boardId
 * @param {String} ideaContent
 * @returns {Promise} - resolves to a client friendly response of all ideas on
 * the given board
 */
self.create = function(userId, boardId, ideaContent) {
  return new Idea({boardId: boardId, userId: userId,
                  content: ideaContent}).save()
  .then(() => self.getIdeas(boardId));
};

/**
 * Delete an Idea
 * @param {String} boardId
 * @param {String} ideaContent
 * @returns {Promise} - resolves to a client friendly response of all ideas on
 * the given board
 * @XXX we need to give mongoose and _id to remove a object, but we don't want
 * to include that in requests to client. How can we DRY that out so we don't
 * repeat logic everywhere?
 */
self.destroy = function(boardId, ideaContent) {

  return Idea.findOne({boardId: boardId, content: ideaContent}).exec()
  .then((idea) => maybeThrowNotFound(idea, boardId, ideaContent))
  .then((idea) => idea.remove())
  .then(() => self.getIdeas(boardId));
};

/**
 * Finds a single Idea based on boardId and content
 * Differs from the mongoose findByContent method in that it throws a not found
 * error instead of returning null when no collection can be found
 * @param {String} boardId
 * @param {String} ideaContent
 * @returns {Promise} resolves to a single idea as a Mongoose result object or
 * rejects with a not found error
 */
self.findByContent = function(boardId, ideaContent) {
  return Idea.findByContent(boardId, ideaContent)
  .then((idea) => maybeThrowNotFound(idea, boardId, ideaContent));
};

self.getIdeas = function(boardId) {
  return Idea.findOnBoard(boardId);
};

module.exports = self;
