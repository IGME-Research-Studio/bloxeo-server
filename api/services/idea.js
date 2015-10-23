/**
 * Idea Service
 *
 * @file Contains logic for Idea related actions
 * @module services/idea
 */

const idea = {};

/**
 * Create a new Idea
 */
idea.create = function(user, content, boardId) {

  Board.findOne({boardId: boardId}).populate('ideas').then(function(board) {

    // if there are any ideas in the board already
    if (board.ideas.length !== 0) {

      // loop through all ideas
      for (let i = 0; i < board.ideas.length; i++) {

        // if an idea has the same content as the one the user wants to create
        if (board.ideas[i].content === content) {

          // return bad request
          throw new Error('Idea exists');
        }
      }
    }
  }).catch(function(err) {

    // throw error if board cannot be found
    throw new Error(err);
  });

  // create new Idea
  return Idea.create({user: user, content: content});
};

/**
 * Delete an Idea
 */
idea.delete = function(ideaID) {

  return Idea.destroy({'id': ideaID});
};

module.exports = idea;
