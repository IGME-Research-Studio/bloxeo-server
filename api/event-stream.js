/*
 * event-stream
 *
 * Exports a singleton event stream for the internal application logic
 * Extend the built in event emitter with some convenience functions for
 * emitting the same events.
 */

import { EventEmitter } from 'events';

import INT_EVENTS from './constants/INT_EVENT_API';

/**
* Helper method to construct a standard object to send to Socket.io
*
* @param {Number} code equivalent HTTP status code
* @param {String} event the client-facing event that socket io
* should broadcast
* @param {Object} data arbitrary data object, what client wants to receive
* @param {String} boardId
* @param {String} msg a message describing the operation
*/
function success(code, event, data, boardId, msg) {
  return {
    event: event,
    boardId: boardId,
    res: {
      ts: new Date().getTime(),
      code: code,
      data: data,
      message: msg,
    },
  };
}

function error(code, event, data, socket, msg) {
  return {
    event: event,
    socket: socket,
    res: {
      ts: new Date().getTime(),
      code: code,
      data: data,
      message: msg,
    },
  };
}
class EventStream extends EventEmitter {

  /**
  * Emits a broadcast event to tell socket.io to broadcast to a room
  *
  * @param {Object} req can be anything to pass along to client
  * @param {Object} req.boardId what board to send to
  */
  broadcast(req) {
    this.emit(INT_EVENTS.BROADCAST, req);
  }

  /**
  * Emits an event to a specific socket
  *
  * @param {Object} req
  * @param {Object} req.socket the socket to emit to
  * @param {Object} req.event the socket event
  * @param {Object} req.res data to send to client
  */
  emitTo(req) {
    this.emit(INT_EVENTS.EMIT_TO, req);
  }

  join(socket, boardId) {
    this.emit(INT_EVENTS.JOIN, {socket: socket, boardId: boardId});
  }

  leave(socket, boardId) {
    this.emit(INT_EVENTS.LEAVE, {socket: socket, boardId: boardId});
  }

  /**
  * 2xx codes use the following interface
  * @param {String} event socket event to send to client
  * @param {Object} data arbitrary data to send to client
  * @param {String} boardId user facing boardId to broadcast the message to
  * @param {String=} message optional HTTP-like message
  * Sends a broadcast to the room identified by the boardId
  */
  ok(event, data, boardId, message) {
    const msg = message || 'Operation succesful';
    this.broadcast(success(200, event, data, boardId, msg));
  }

  created(event, data, boardId, message) {
    const msg = message || 'Resource created.';
    this.broadcast(success(201, event, data, boardId, msg));
  }

  accepted(event, data, boardId, message) {
    const msg = message || 'Accepted for processing, may be rejected later.';
    this.broadcast(success(202, event, data, boardId, msg));
  }

  /**
  * 4xx and 5xx codes use the following interface
  * @param {String} event socket event to send to client
  * @param {Object} data arbitrary data to send to client
  * @param {Object} socket the requesting socket
  * @param {String=} message optional HTTP-like message
  * Sends a emission to the socket identified by the socket
  */
  badRequest(event, data, socket, message) {
    const msg = message || 'Accepted for processing, may be rejected later.';
    this.emitTo(error(400, event, data, socket, msg));
  }

  unauthorized(event, data, socket, message) {
    const msg = message || 'Authentication required for this operation.';
    this.emitTo(error(401, event, data, socket, msg));
  }

  notFound(event, data, socket, message) {
    const msg = message || 'Resource not found';
    this.emitTo(error(404, event, data, socket, msg));
  }

  serverError(event, data, socket, message) {
    const msg = message || 'Something went wrong on the server';
    this.emitTo(error(500, event, data, socket, msg));
  }

  notImplemented(event, data, socket, message) {
    const msg = message || 'Not available now, but may be in the future';
    this.emitTo(error(501, event, data, socket, msg));
  }
}

export default new EventStream();
