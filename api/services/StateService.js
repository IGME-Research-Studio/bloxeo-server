/**
  State Service

  @file Contains logic for controlling the state of a board
*/
const RedisService = require('./RedisService.js');

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
* Check if a state already exists in Redis to prevent overwritting it in case Redis goes down.
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {StateEnum} state: The state object to be set on Redis
*/
stateService.setState = function(boardId, state) {
  stateService.getState(boardId).then(function(result) {
    if (result === undefined) {
      RedisService.set(boardId, JSON.stringify(state));
    }
  });
};

/**
* Get the current state of the board from Redis. Returns a promise.
* @param {string} boardId: The string id generated for the board (not the mongo id)
*/
stateService.getState = function(boardId) {
  return RedisService.get(boardId);
};

/**
* Create and connect to a new instance of Redis and set the default state
* @param {string} boardId: The string id generated for the board (not the mongo id)
* @param {string} url: A url to run Redis on (default Redis connection is made if not provided)
*/
stateService.connectToRedis = function(boardId) {
  stateService.setState(boardId, stateService.StateEnum.createIdeasAndIdeaCollections);
};

module.exports = stateService;
