/**
 * Dispatcher
 *
 */

import sio from 'socket.io';
// import socketioJwt from 'socketio-jwt';
// import CFG from './config';

import stream from './event-stream';

import joinRoom from './handlers/v1/rooms/join';
import leaveRoom from './handlers/v1/rooms/leave';

import createIdea from './handlers/v1/ideas/create';
import destroyIdea from './handlers/v1/ideas/destroy';
import getIdeas from './handlers/v1/ideas/index';

import createCollection from './handlers/v1/ideaCollections/create';
import destroyCollection from './handlers/v1/ideaCollections/destroy';
import addIdea from './handlers/v1/ideaCollections/addIdea';
import removeIdea from './handlers/v1/ideaCollections/removeIdea';
import getCollections from './handlers/v1/ideaCollections/index';

import EXT_EVENTS from './constants/EXT_EVENT_API';
import INT_EVENTS from './constants/INT_EVENT_API';

const dispatcher = function(server) {
  const io = sio(server);

  /**
   * In the future we will authenticate all communication within a room w/JWT
   * CFG.jwt has a secret string and a timeout period for auth.
   *
   * @todo Implement a JWT token service so that client can actually get tokens
   *
   * @example Client code for using this authorization:
   *
   * sio.of('/rooms', function(socket) {
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
    socket.on(EXT_EVENTS.JOIN_ROOM, (req) => {
      joinRoom(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.LEAVE_ROOM, (req) => {
      leaveRoom(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.CREATE_IDEA, (req) => {
      createIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DESTROY_IDEA, (req) => {
      destroyIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.GET_IDEAS, (req) => {
      getIdeas(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.CREATE_COLLECTION, (req) => {
      createCollection(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DESTROY_COLLECTION, (req) => {
      destroyCollection(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.ADD_IDEA, (req) => {
      addIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.REMOVE_IDEA, (req) => {
      removeIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.GET_COLLECTIONS, (req) => {
      getCollections(_.merge({socket: socket}, req));
    });

  });

  stream.on(INT_EVENTS.BROADCAST, (req) => {
    io.sockets.in(req.boardId).emit(req.event, req.res);
  });

  stream.on(INT_EVENTS.EMIT_TO, (req) => {
    io.sockets.to(req.socketId).emit(req.event, req.res);
  });

  stream.on(INT_EVENTS.JOIN, (req) => {
    req.socket.join(req.boardId);
  });

  stream.on(INT_EVENTS.LEAVE, (req) => {
    req.socket.leave(req.boardId);
  });
};

export default dispatcher;
