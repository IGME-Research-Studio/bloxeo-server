/**
* EXT_EVENT_API
*
* These are the names for our socket events that we should use internally
* and what we should send to client on initialization.
*
* Requests should be imperative
* Responses should be past tense
*/

module.exports = {
  // Imperative requests
  GET_CONSTANTS: 'GET_CONSTANTS',

  JOIN_ROOM: 'JOIN_ROOM',
  LEAVE_ROOM: 'LEAVE_ROOM',

  CREATE_IDEA: 'CREATE_IDEA',
  DESTROY_IDEA: 'DESTROY_IDEA',
  GET_IDEAS: 'GET_IDEAS',

  CREATE_COLLECTION: 'CREATE_COLLECTION',
  DESTROY_COLLECTION: 'DESTROY_COLLECTION',
  ADD_IDEA: 'ADD_IDEA',
  REMOVE_IDEA: 'REMOVE_IDEA',
  GET_COLLECTIONS: 'GET_COLLECTIONS',

  START_TIMER: 'START_TIMER',
  DISABLE_TIMER: 'DISABLE_TIMER',

  // Past-tense responses
  RECEIVED_CONSTANTS: 'RECEIVED_CONSTANTS',
  RECEIVED_IDEAS: 'RECEIVED_IDEAS',
  RECEIVED_COLLECTIONS: 'RECEIVED_COLLECTIONS',

  JOINED_ROOM: 'JOINED_ROOM',
  LEFT_ROOM: 'LEFT_ROOM',

  STARTED_TIMER: 'STARTED_TIMER',
  DISABLED_TIMER: 'DISABLED_TIMER',

  UPDATED_IDEAS: 'UPDATED_IDEAS',
  UPDATED_COLLECTIONS: 'UPDATED_COLLECTIONS',

  ADDED_USER: 'ADDED_USER',
  REMOVED_USER: 'REMOVE_DUSER',
  ADDED_ADMIN: 'ADDED_ADMIN',
  REMOVED_ADMIN: 'REMOVED_ADMIN',
  ADDED_PENDING_USER: 'ADDED_PENDING_USER',
  REMOVED_PENDING_USER: 'REMOVED_PENDING_USER',
};
