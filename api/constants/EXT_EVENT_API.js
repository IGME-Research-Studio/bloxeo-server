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
  'SEND_CONSTANTS': 'SendConstants',

  'JOIN_ROOM': 'JoinRoom',
  'LEAVE_ROOM': 'LeaveRoom',

  'CREATE_IDEA': 'CreateIdea',
  'REMOVE_IDEA': 'RemoveIdea',
  'GET_IDEAS': 'GetIdeas',

  // 'CREATE_COLLECTION': 'CreateCollection',
  // 'REMOVE_COLLECTION': 'RemoveCollection',

  // Past-tense responses
  'JOINED_ROOM': 'JoinedRoom',
  'LEFT_ROOM': 'LeftRoom',

  'UPDATED_IDEAS': 'UpdatedIdeas',

  'ADDED_COLLECTION': 'AddedCollection',
  'REMOVED_COLLECTION': 'RemovedCollection',
  'MODIFIED_COLLECTION': 'ModifiedCollection',

  'ADDED_USER': 'AddedUser',
  'REMOVED_USER': 'RemovedUser',
  'ADDED_ADMIN': 'AddedAdmin',
  'REMOVED_ADMIN': 'RemovedAdmin',
  'ADDED_PENDING_USER': 'AddedPendingUser',
  'REMOVED_PENDING_USER': 'RemovedPendingUser',
};
