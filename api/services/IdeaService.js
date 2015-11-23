/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module IdeaService api/services/IdeaService
 */

import { model as Idea } from '../models/Idea.js';
const ideaService = {};

/**
 * Create a new Idea
 */
ideaService.create = function(user, boardId, content) {

  return new Idea({boardId: boardId, user: user, content: content}).save()
  .then(() => ideaService.getIdeas(boardId));
};

/**
 * Delete an Idea
 */
ideaService.destroy = function(boardId, ideaContent) {

  return Idea.find({boardId: boardId, content: ideaContent}).remove()
  .then(() => ideaService.getIdeas(boardId));
};

ideaService.getIdeas = function(boardId) {
  return Idea.findOnBoard(boardId);
};

module.exports = ideaService;
