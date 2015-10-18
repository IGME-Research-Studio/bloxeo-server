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
idea.create = function(user, content) {

  // create new Idea
  return Idea.create({user: user, content: content});
};

/**
 * Delete an Idea
 */
idea.delete = function(ideaID) {
  console.log('service/idea::delete is not implemented yet');

  Idea.destroy({'id': ideaID}).exec(function(err, result) {

    console.log('delete');
    console.log(result);
  });
};

module.exports = idea;
