/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module IdeaService api/services/IdeaServices
 */

const Idea = require('../models/Idea.js');

const ideaService = {};

/**
 * Create a new Idea
 */
ideaService.create = function(user, boardId, content) {

  const i =  new Idea.model({boardId: boardId, user: user, content: content});
  return i.save();
};

/**
 * Delete an Idea
 */
ideaService.destroy = function(boardId, ideaContent) {

  return Idea.model.find({boardId: boardId, content: ideaContent})
  .remove();
};

ideaService.getIdeas = function(boardId) {
  return Idea.model.find({boardId: boardId})
  .select('-_id')
  .exec((ideas) => ideas);
};

module.exports = ideaService;
