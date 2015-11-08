/**
* EVENT_API
*
* These are the names for our socket events that we should use internally
* and what we should send to client on initialization.
*
* They are all past tense, because they are updates that are being emitted
* from the server about things that have already happened.
*/

module.exports = {
  `JOINED_ROOM`: `JoinedRoom`,
  `LEFT_ROOM`: `LeftRoom`,

  `UPDATED_IDEAS`: `UpdatedIdeas`,

  `ADDED_COLLECTION`: `AddedCollection`,
  `REMOVED_COLLECTION`: `RemovedCollection`,
  `MODIFIED_COLLECTION`: `ModifiedCollection`,

  `ADDED_USER`: `AddedUser`,
  `REMOVED_USER`: `RemovedUser`,
  `ADDED_ADMIN`: `AddedAdmin`,
  `REMOVED_ADMIN`: `RemovedAdmin`,
  `ADDED_PENDING_USER`: `AddedPendingUser`,
  `REMOVED_PENDING_USER`: `RemovedPendingUser`,
};
