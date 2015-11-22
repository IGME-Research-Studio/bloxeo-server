/**
  State Service

  @file Contains logic for controlling the state of a board
*/
const RedisService = require('./RedisService');
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

/**
* Set the current state of the board on Redis.
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {StateEnum} state: The state object to be set on Redis
*/
stateService.setState = function(boardId, state) {
  RedisService.set(boardId, JSON.stringify(state));
};

/**
* Get the current state of the board from Redis. Returns a promise containing the state.
* @param {string} boardId: The string id generated for the board (not the mongo id)
*/
stateService.getState = function(boardId) {
  return RedisService.get(boardId).then(function(result) {
    if (result !== undefined) {
      return result;
    }
    else {
      this.setState(boardId, this.StateEnum.createIdeasAndIdeaCollections);
      return this.StateEnum.createIdeasAndIdeaCollections;
    }
  });
};

module.exports = stateService;
