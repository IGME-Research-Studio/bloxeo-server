/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module IdeaService api/services/IdeaService
 */

import { model as Idea } from '../models/Idea.js';
import { toClient, errorHandler } from '../services/utils';

const ideaService = {};

/**
 * Create a new Idea
 */
ideaService.create = function(user, boardId, ideaContent) {

  return new Idea({boardId: boardId, user: user, content: ideaContent}).save()
  .then(() => ideaService.getIdeas(boardId))
  .catch(errorHandler);
};

/**
 * Delete an Idea
 */
ideaService.destroy = function(boardId, ideaContent) {

  return Idea.find({boardId: boardId, content: ideaContent}).remove()
  .then(() => ideaService.getIdeas(boardId))
  .catch(errorHandler);
};

ideaService.getIdeas = function(boardId) {
  return Idea.findOnBoard(boardId)
  .then(toClient)
  .catch(errorHandler);
};

module.exports = ideaService;
