/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module services/idea
 */

const boardService = require('../services/BoardService.js');

const ideaService = {};

/**
 * Create a new Idea
 */
ideaService.create = function(user, content, boardId) {

  return boardService.findBoardAndPopulate(boardId, 'ideas').then(function(board) {

    // if there are any ideas in the board already
    if (board.ideas.length !== 0) {

      // loop through all ideas
      for (let i = 0; i < board.ideas.length; i++) {

        // if an idea has the same content as the one the user wants to create
        if (board.ideas[i].content === content) {

          // return bad request
          throw new Error('Idea Exists');
        }
      }
    }

    // create new Idea
    return Idea.create({user: user, content: content});

  }).catch(function(err) {

    // throw error if board cannot be found
    throw new Error(err);
  });
};

/**
 * Delete an Idea
 */
ideaService.delete = function(boardId, ideaId) {

  // find the idea
  Idea.findOne({id: ideaId}).then(function(idea) {

    // remove the idea from the board
    boardService.removeIdea(boardId, idea.id);

    // error handling
  }).catch(function(err) {

    throw new Error(err);
  });

  // return destroyed idea
  return Idea.destroy({'id': ideaId});
};

module.exports = ideaService;
