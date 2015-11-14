/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module services/idea
 */

const Idea = require('../models/Idea.js');

const ideaService = {};

/**
 * Create a new Idea
 */
ideaService.create = function(user, content, boardId) {

  return Idea.model.create({boardId: boardId, user: user, content: content});
};

/**
 * Delete an Idea
 */
ideaService.destroy = function(boardId, ideaContent) {

  return Idea.model.find({boardId: boardId, content: ideaContent})
    .then((idea) => idea.remove())
    .catch(() => {
      throw new Error('Idea could not be deleted');
    });
};

module.exports = ideaService;
