/**
  State Service

  @file Contains logic for controlling the state of a board
*/
import BoardService from './BoardService';
import TokenService from './TokenService';
import KeyValService from './KeyValService';
const self = {};

self.StateEnum = {
  createIdeasAndIdeaCollections: {
    createIdeas: true,
    createIdeaCollections: true,
    voting: false,
    results: true,
  },
  createIdeaCollections: {
    createIdeas: false,
    createIdeaCollections: true,
    voting: false,
    results: true,
  },
  voteOnIdeaCollections: {
    createIdeas: false,
    createIdeaCollections: false,
    voting: true,
    results: false,
  },
};

/**
* Check if an action requires admin permissions and verify the user is an admin
* @param {Boolean} requiresAdmin: whether or not the state change requires an admin
* @param {String} boardId: the if of the board
* @param {String} userToken: the encrypted token containing a user id
* @returns {Promise<Boolean|UnauthorizedError|Error>}
*/
function checkRequiresAdmin(requiresAdmin, boardId, userToken) {
  if (requiresAdmin) {
    return TokenService.verifyAndGetId(userToken)
      .then((userId) => BoardService.errorIfNotAdmin(boardId, userId));
  }
  else {
    return false;
  }
}

/**
* Set the current state of the board on Redis.
* Returns a promise containing the boolean showing the success of setting the state
* @param {String} boardId: The string id generated for the board (not the mongo id)
* @param {Object} state: The state object to be set on Redis
* @param {Boolean} requiresAdmin: Whether or not the state change needs an admin
* @param {String} userToken: token representing an encrypted user id
* @returns {Promise<Object|Error>} Promise containing the state object
*/
self.setState = function(boardId, state, requiresAdmin, userToken) {
  return checkRequiresAdmin(requiresAdmin, boardId, userToken)
  .then(() => self.removeState(boardId))
  .then(() => KeyValService.setBoardState(boardId, state));
};

/**
* Get the current state of the board from Redis. Returns a promise containing the state.
* @param {String} boardId: The string id generated for the board (not the mongo id)
* @returns {Promise{Object}}
* @TODO Figure out what to do for a default state if the server crashes and resets
*/
self.getState = function(boardId) {
  return KeyValService.getBoardState(boardId);
};

/**
* Remove the current state. Used for transitioning to remove current state key
* @param {String} boardId: The string id generated for the board (not the mongo id)
* @returns {Promise<Integer|Error>}: returns the number of keys deleted
*/
self.removeState = function(boardId) {
  return KeyValService.checkBoardStateExists(boardId)
  .then((exists) => {
    if (exists) {
      return KeyValService.clearBoardState(boardId);
    }
    else {
      return false;
    }
  });
};

/**
* Set the state to create ideas and idea collections
* @param {String} boardId: the id of the board
* @param {Boolean} requiresAdmin: whether or not the state change needs an admin
* @param {String} userToken: the encrypted token containing a user id
* @returns {Promise<Boolean|NoOpError|Error>}
*/
self.createIdeasAndIdeaCollections = function(boardId, requiresAdmin, userToken) {
  return self.setState(boardId,
                       self.StateEnum.createIdeasAndIdeaCollections,
                       requiresAdmin,
                       userToken);
};

/**
* Set the state to create idea collections
* @param {String} boardId: the id of the board
* @param {Boolean} requiresAdmin: whether or not the state change needs an admin
* @param {String} userToken: the encrypted token containing a user id
* @returns {Promise<Boolean|NoOpError|Error>}
*/
self.createIdeaCollections = function(boardId, requiresAdmin, userToken) {
  return self.setState(boardId,
                       self.StateEnum.createIdeaCollections,
                       requiresAdmin,
                       userToken);
};

/**
* Set the state to vote on idea collections
* @param {String} boardId: the id of the board
* @param {Boolean} requiresAdmin: whether or not the state change needs an admin
* @param {String} userToken: the encrypted token containing a user id
* @returns {Promise<Boolean|NoOpError|Error>}
*/
self.voteOnIdeaCollections = function(boardId, requiresAdmin, userToken) {
  BoardService.areThereCollections(boardId)
  .then((hasCollections) => {
    if (hasCollections) {
      return self.setState(boardId,
                           self.StateEnum.voteOnIdeaCollections,
                           requiresAdmin,
                           userToken);
    }
    else {
      throw new Error('Board cannot transition to voting without collections');
    }
  });
};

module.exports = self;
