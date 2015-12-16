/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module IdeaService api/services/IdeaService
 */

import { model as Idea } from '../models/Idea.js';
import { isNull } from './ValidatorService';

const ideaService = {};

// Private
const maybeThrowNotFound = (obj, boardId, content) => {
  if (isNull(obj)) {
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
ideaService.create = function(userId, boardId, ideaContent) {
  return new Idea({boardId: boardId, userId: userId,
                  content: ideaContent}).save()
  .then(() => ideaService.getIdeas(boardId));
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
ideaService.destroy = function(boardId, ideaContent) {

  return Idea.findOne({boardId: boardId, content: ideaContent}).exec()
  .then((idea) => maybeThrowNotFound(idea, boardId, ideaContent))
  .then((idea) => idea.remove())
  .then(() => ideaService.getIdeas(boardId));
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
ideaService.findByContent = function(boardId, ideaContent) {
  return Idea.findByContent(boardId, ideaContent)
  .then((idea) => maybeThrowNotFound(idea, boardId, ideaContent));
};

ideaService.getIdeas = function(boardId) {
  return Idea.findOnBoard(boardId);
};

module.exports = ideaService;
