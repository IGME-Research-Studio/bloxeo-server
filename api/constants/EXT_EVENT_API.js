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
  GET_CONSTANTS: 'GetConstants',

  JOIN_ROOM: 'JoinRoom',
  LEAVE_ROOM: 'LeaveRoom',

  CREATE_IDEA: 'CreateIdea',
  DESTROY_IDEA: 'DestroyIdea',
  GET_IDEAS: 'GetIdeas',

  CREATE_COLLECTION: 'CreateCollection',
  DESTROY_COLLECTION: 'DestroyCollection',
  ADD_IDEA: 'AddIdea',
  REMOVE_IDEA: 'RemoveIdea',
  GET_COLLECTIONS: 'GetCollections',

  // Past-tense responses
  RECIEVED_CONSTANTS: 'RecievedConstants',
  RECIEVED_IDEAS: 'RecievedIdeas',
  RECIEVED_COLLECTIONS: 'RecievedCollections',

  JOINED_ROOM: 'JoinedRoom',
  LEFT_ROOM: 'LeftRoom',

  UPDATED_IDEAS: 'UpdateIdeas',

  ADDED_COLLECTION: 'AddedCollection',
  REMOVED_COLLECTION: 'RemovedCollection',
  MODIFIED_COLLECTION: 'ModifiedCollection',

  ADDED_USER: 'AddedUser',
  REMOVED_USER: 'RemovedUser',
  ADDED_ADMIN: 'AddedAdmin',
  REMOVED_ADMIN: 'RemovedAdmin',
  ADDED_PENDING_USER: 'AddedPendingUser',
  REMOVED_PENDING_USER: 'RemovedPendingUser',
};
