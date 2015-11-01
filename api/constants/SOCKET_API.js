/**
* SOCKET_API
*
* These are the names for our socket events that we should use internally
* and what we should send to client on initialization.
*
* They are all past tense, because they are updates that are being emitted
* from the server about things that have already happened.
*/

module.export = {
  'UPDATED_IDEAS': 'UpdatedIdeas',

  'ADDED_COLLECTION': 'AddedCollection',
  'REMOVED_COLLECTION': 'RemovedCollection',
  'UPDATED_COLLECTION': 'UpdatedCollection',

  'ADDED_USER': 'AddedUser',
  'REMOVED_USER': 'RemovedUser',
  'ADDED_ADMIN': 'AddedAdmin',
  'REMOVED_ADMIN': 'RemovedAdmin',
  'ADDED_PENDING_USER': 'AddedPendingUser',
  'REMOVED_PENDING_USER': 'RemovedPendingUser'
};
