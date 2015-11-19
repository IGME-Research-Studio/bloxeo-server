/**
* INT_EVENT_API
*
* These events are for our internal event stream, they are never exposed to
* client.
*/

module.exports = {
  BROADCAST: 'broadcast',
  JOIN: 'join',
  LEAVE: 'leave',
};
