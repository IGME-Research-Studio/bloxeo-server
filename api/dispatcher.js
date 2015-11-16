/**
 * Dispatcher
 *
 */

import socket from 'socket.io';
import socketioJwt from 'socketio-jwt';

import stream from './event-stream';
import CFG from './config';

import joinRoom from './handlers/v1/rooms/join';
import leaveRoom from './handlers/v1/rooms/leave';

import EXT_EVENTS from './constants/EXT_EVENT_API';
import INT_EVENTS from './constants/INT_EVENT_API';

const dispatcher = function(server) {
  const io = socket(server);

  /**
   * In the future we will authenticate all communication within a room w/JWT
   * CFG.jwt has a secret string and a timeout period for auth.
   *
   * @todo Implement a JWT token service so that client can actually get tokens
   *
   * @example Client code for using this authorization:
   *
   * socket.of('/rooms', function(socket) {
   *   socket.on('authenticated', function () {
   *      // do other things
   *    })
   *    // send the jwt, stored in retrieved from the server or stored in LS
   *    .emit('authenticate', {token: jwt});
   *  })
   */
   /* io.of('/rooms')
   *   .on('connection', socketioJwt.authorize(CFG.jwt));
   *
   * io.on('authenticated', function(socket) {
   *     console.log(socket.decoded_token);
   * });
   */

  io.on('connection', function(socket) {
    console.log(socket.id);

    socket.on(EXT_EVENTS.JOIN_ROOM, (req) => {
      joinRoom({socket: socket, boardId: req});
    });

    socket.on(EXT_EVENTS.LEAVE_ROOM, (req) => {
      leaveRoom({socket: socket, boardId: req});
    });
  });

  stream.on(INT_EVENTS.BROADCAST, (req) => {
    io.sockets.in(req.boardId).emit(req.event, req.body);
  });

  stream.on(INT_EVENTS.JOIN, (req) => {
    req.socket.join(req.boardId);
  });

  stream.on(INT_EVENTS.LEAVE, (req) => {
    req.socket.leave(req.boardId);
  });
};

export default dispatcher;
