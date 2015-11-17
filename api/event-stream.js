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
 * BoardId may be undefined for operations that don't occur on a board
 *
 * @param {Number} code equivalent HTTP status code
 * @param {String} msg a message describing the operation
 * @param {String} event the client-facing event that socket io
 * should broadcast
 * @param {Object} data arbitrary data object, what client wants to receive
 * @param {String} boardId optional parameter for operations that occur on
 * a board
 * @returns {Object}
 */
function response(code, msg, event, data, boardId) {
  return {
    event: event,
    boardId: boardId || undefined,
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
  * Emits a broadcast event to tell socket to broadcast to clients
  * @param {Object} req can be anything to pass along to client
  */
  broadcast(req) {
    this.emit(INT_EVENTS.BROADCAST, req);
  }

  join(req) {
    this.emit(INT_EVENTS.JOIN, req);
  }

  leave(req) {
    this.emit(INT_EVENTS.LEAVE, req);
  }

  ok(event, data, message) {
    const msg = message || 'Operation succesful';
    this.emit(INT_EVENTS.BROADCAST,
      response(200, msg, event, data));
  }

  created(event, data, message) {
    const msg = message || 'Resource created.';
    this.emit(INT_EVENTS.BROADCAST,
      response(201, msg, event, data));
  }

  accepted(event, data, message) {
    const msg = message || 'Accepted for processing, may be rejected later.';
    this.emit(INT_EVENTS.BROADCAST,
      response(202, msg, event, data));
  }

  badRequest(event, data, message) {
    const msg = message || 'Accepted for processing, may be rejected later.';
    this.emit(INT_EVENTS.BROADCAST,
      response(400, msg, event, data));
  }

  unauthorized(event, data, message) {
    const msg = message || 'Authentication required for this operation.';
    this.emit(INT_EVENTS.BROADCAST,
      response(401, msg, event, data));
  }

  notFound(event, data, message) {
    const msg = message || 'Resource not found';
    this.emit(INT_EVENTS.BROADCAST,
      response(404, msg, event, data));
  }

  serverError(event, data, message) {
    const msg = message || 'Something went wrong on the server';
    this.emit(INT_EVENTS.BROADCAST,
      response(500, msg, event, data));
  }

  notImplemented(event, data, message) {
    const msg = message || 'Not available now, but may be in the future';
    this.emit(INT_EVENTS.BROADCAST,
      response(501, msg, event, data));
  }
}

export default new EventStream();
