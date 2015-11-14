/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module services/idea
 */

const BoardService = require('../services/BoardService.js');
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
ideaService.delete = function(boardId, ideaContent) {

  return Idea.model.find({boardId: boardId, content: ideaContent})
    .catch(() => { throw new Error('Idea does not exist'); })
    .then((idea) => BoardService.removeIdea(boardId, idea.id))
    .catch(() => { throw new Error('Idea could not be deleted'); });
};


module.exports = ideaService;
