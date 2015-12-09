/**
  State Service

  @file Contains logic for controlling the state of a board
*/
const RedisService = require('./RedisService');
const Promise = require('bluebird');
// const EXT_EVENTS = require('../constants/EXT_EVENT_API');
// const stream = require('../event-stream');
const stateService = {};

stateService.StateEnum = {
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
stateService.setState = function(boardId, state, requiresAdmin, userToken) {
  checkRequiresAdmin(requiresAdmin, userToken)
  .then(() => {
    return RedisService.set(boardId + '-state', JSON.stringify(state))
    .then((result) => {
      if (result.toLowerCase() === 'ok') {
        return true;
      }
      else {
        return false;
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
stateService.getState = function(boardId) {
  return RedisService.get(boardId + '-state').then(function(result) {
    if (result !== undefined) {
      return JSON.parse(result);
    }
    else {
      this.setState(boardId, this.StateEnum.createIdeasAndIdeaCollections);
      return this.StateEnum.createIdeasAndIdeaCollections;
    }
  });
};

stateService.createIdeasAndIdeaCollections = function(boardId, requiresAdmin, userToken) {
  this.setState(boardId, this.StateEnum.createIdeasAndIdeaCollections, requiresAdmin, userToken);
};

stateService.createIdeaCollections = function(boardId, requiresAdmin, userToken) {
  this.setState(boardId, this.StateEnum.createIdeaCollections, requiresAdmin, userToken);
};

stateService.voteOnIdeaCollections = function(boardId, requiresAdmin, userToken) {
  this.setState(boardId, this.StateEnum.voteOnIdeaCollections, requiresAdmin, userToken);
};

module.exports = stateService;
