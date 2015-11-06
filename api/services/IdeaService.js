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
          throw new Error(`Idea with content "${content}" already exists`);
        }
      }
    }

    // create new Idea
    return Idea.create({user: user, content: content});

  }).catch(function() {

    throw new Error(`Board with id ${boardId} could not be found`);
  });
};

/**
 * Delete an Idea
 */
ideaService.delete = function(boardId, ideaContent) {

  return BoardService.findIdeaByContent(boardId, ideaContent)
    .then((idea) => idea.id)
    .catch(() => { throw new Error('Idea does not exist'); })
    .then((ideaId) => {
      return [BoardService.removeFrom('ideas', boardId, ideaId), ideaId];
    })
    .spread(function(board, id) {
      return Idea.destroy(id);
    })
    .catch(() => { throw new Error('Idea could not be deleted'); });
};

module.exports = ideaService;
