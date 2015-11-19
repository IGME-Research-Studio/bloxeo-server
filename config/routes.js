/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default
 * Gruntfile in Sails copies flat files from `assets` to `.tmp/public`.
 * This allows you to do things like compile LESS or CoffeeScript for the
 * front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

require("babel/register");

const _ = require('lodash');
const VersionService = require('../api/services/VersionService');

const routes = {
  // 'get /boat': 'BoatController.find',
  // 'get /boat/:id': 'BoatController.findOne',
  // 'post /boat': 'BoatController.create',
  // 'put /boat/:id': 'BoatController.update',
  // 'delete /boat/:id': 'BoatController.destroy',
  //
  // 'post /boat/:parentid/collections/:id': 'BoatController.addToCollection',
  // 'delete /boat/:parentid/collections/:id': 'BoatController.remove',

  '/constants': 'ConstantsController.index',

  /**
  * Board routes
  */
  'get /boards': 'BoardController.find',
  // @todo: not implemented yet, would currently use a mongo id for boardId
  'get /boards/:boardId': 'BoardController.findOne',
  'post /boards': 'BoardController.create',
  'delete /boards/:boardId': 'BoardController.destroy',
  // @todo: not implemented yet, would currently use a mongo id for boardId
  'put /boards/:boardId': 'BoardController.update',

  // Socket only routes
  'post /rooms/:boardId/join': 'BoardController.join',
  'post /rooms/:boardId/leave': 'BoardController.leave',

  /**
  * Idea routes
  */
  'get /boards/:boardId/ideas': 'IdeaController.index',
  'post /boards/:boardId/ideas': 'IdeaController.create',
  // @todo: not implemented yet, would currently use a mongo id for index
  'put /boards/:boardId/ideas/:index': 'IdeaController.update',

  'delete /boards/:boardId/ideas': 'IdeaController.destroy',

  /**
  * IdeaCollection routes
  */
  'get /boards/:boardId/ideaCollections': 'IdeaCollectionController.getCollections',
  'post /boards/:boardId/ideaCollections': 'IdeaCollectionController.create',
  // @todo: Hack to allow for voting updates for now
  // @todo: not implemented yet, would currently use a mongo id for index
  'put /boards/:boardId/ideaCollections/:index': 'IdeaCollectionController.update',

  // only expose the ability to add on create for now
  'delete /boards/:boardId/ideaCollections': 'IdeaCollectionController.destroy',

  'post /boards/:boardId/ideaCollections/:index/ideas': 'IdeaCollectionController.addIdea',
  'delete /boards/:boardId/ideaCollections/:index/ideas': 'IdeaCollectionController.removeIdea',

  /**
  * User routes
  */

  /**
  * Login/Authentication routes
  */
  'get /login': 'AuthController.login',
  'get /logout': 'AuthController.logout',
  'get /register': 'AuthController.register',

  'post /auth/local': 'AuthController.callback',
  'post /auth/local/:action': 'AuthController.callback',

  'get /auth/:provider': 'AuthController.provider',
  'get /auth/:provider/callback': 'AuthController.callback',
  'get /auth/:provider/:action': 'AuthController.callback',
};

module.exports.routes = _.mapKeys(routes, function(ctrl, route) {
  return VersionService.prefixRoute(route)
});
