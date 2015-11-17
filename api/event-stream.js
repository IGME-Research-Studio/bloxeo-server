/*
 * event-stream
 *
 * Exports a singleton event stream for the internal application logic
 * Extend the built in event emitter with some convenience functions for
 * emitting the same events.
 */

import { EventEmitter } from 'events';
import util from 'util';
import _ from 'lodash';

import INT_EVENTS from './constants/INT_EVENT_API';

/**
* Helper method to construct a standard object to send to Socket.io
*
* @param {Number} code equivalent HTTP status code
* @param {String} msg a message describing the operation
* @param {String} event the client-facing event that socket io
* should broadcast
* @param {Object} data arbitrary data object, what client wants to receive
* @param {String} boardId
*/
function success(code, msg, event, data, boardId) {
  return {
    event: event,
    boardId: boardId,
    res: {
      ts: new Date().getTime(),
      code: code,
      data: data,
      message: msg,
    }
  };
}

function error(code, msg, event, data, socketId) {
  return {
    event: event,
    socketId: socketId,
    res: {
      ts: new Date().getTime(),
      code: code,
      data: data,
      message: msg,
    }
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
    this.broadcast(succes(200, msg, event, data, boardId));
  }

  created(event, data, boardId, message) {
    const msg = message || 'Resource created.';
    this.broadcast(succes(201, msg, event, data, boardId));
  }

  accepted(event, data, boardId, message) {
    const msg = message || 'Accepted for processing, may be rejected later.';
    this.broadcast(succes(202, msg, event, data, boardId));
  }

  /**
  * 4xx and 5xx codes use the following interface
  * @param {String} event socket event to send to client
  * @param {Object} data arbitrary data to send to client
  * @param {Object} socketId the requesting socket
  * @param {String=} message optional HTTP-like message
  * Sends a emission to the socket identified by the socket
  */
  badRequest(event, data, socketId, message) {
    const msg = message || 'Accepted for processing, may be rejected later.';
    this.emitTo(error(400, msg, event, data, socketId));
  }

  unauthorized(event, data, socketId, message) {
    const msg = message || 'Authentication required for this operation.';
    this.emitTo(error(401, msg, event, data, socketId));
  }

  notFound(event, data, socketId, message) {
    const msg = message || 'Resource not found';
    this.emitTo(error(404, msg, event, data, socketId));
  }

  serverError(event, data, socketId, message) {
    const msg = message || 'Something went wrong on the server';
    this.emitTo(error(500, msg, event, data, socketId));
  }

  notImplemented(event, data, socketId, message) {
    const msg = message || 'Not available now, but may be in the future';
    this.emitTo(error(501, msg, event, data, socketId));
  }
}

export default new EventStream();
