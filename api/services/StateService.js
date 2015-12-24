/**
  State Service

  @file Contains logic for controlling the state of a board
*/
const RedisService = require('./RedisService');
const Promise = require('bluebird');
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

function checkRequiresAdmin(requiresAdmin, boardId, userToken) {
  return new Promise((resolve) => {
    if (requiresAdmin) {
      isAdmin(boardId, userToken)
      .then((result) => {
        resolve(result);
      });
    }
    else {
      resolve(false);
    }
  });
}

/**
* Set the current state of the board on Redis.
* Returns a promise containing the boolean showing the success of setting the state
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {StateEnum} state: The state object to be set on Redis
*/
self.setState = function(boardId, state, requiresAdmin, userToken) {
  return checkRequiresAdmin(requiresAdmin, boardId, userToken)
  .then(() => {
    return RedisService.set(boardId + '-state', JSON.stringify(state))
    .then((result) => {
      if (result.toLowerCase() === 'ok') {
        return state;
      }
      else {
        throw new Error('Failed to set state in Redis');
      }
    });
  })
  .catch((err) => {
    throw err;
  });
};

/**
* Get the current state of the board from Redis. Returns a promise containing the state.
* @param {string} boardId: The string id generated for the board (not the mongo id)
*/
self.getState = function(boardId) {
  return RedisService.get(boardId + '-state').then(function(result) {
    if (result !== null) {
      return JSON.parse(result);
    }
    else {
      self.setState(boardId, self.StateEnum.createIdeasAndIdeaCollections);
      return self.StateEnum.createIdeaCollections;
    }
  });
};

self.createIdeasAndIdeaCollections = function(boardId, requiresAdmin, userToken) {
  return self.setState(boardId, self.StateEnum.createIdeasAndIdeaCollections, requiresAdmin, userToken);
};

self.createIdeaCollections = function(boardId, requiresAdmin, userToken) {
  return self.setState(boardId, self.StateEnum.createIdeaCollections, requiresAdmin, userToken);
};

self.voteOnIdeaCollections = function(boardId, requiresAdmin, userToken) {
  return self.setState(boardId, self.StateEnum.voteOnIdeaCollections, requiresAdmin, userToken);
};

module.exports = self;
