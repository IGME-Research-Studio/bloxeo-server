/**
 * Dispatcher
 *
 */

import sio from 'socket.io';
import _ from 'lodash';
import log from 'winston';
// import socketioJwt from 'socketio-jwt';

import stream from './event-stream';
import getConstants from './handlers/v1/constants/index';
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
  const io = sio(server, {
    origins: '*:*',
    logger: {
      debug: log.debug,
      info: log.info,
      error: log.error,
      warn: log.warn,
    },
  });

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
   *
   * io.of('/rooms')
   *   .on('connection', socketioJwt.authorize(CFG.jwt));
   *
   * io.on('authenticated', function(socket) {
   *     console.log(socket.decoded_token);
   * });
   */

  io.on('connection', function(socket) {
    log.info(socket.id);

    socket.on(EXT_EVENTS.GET_CONSTANTS, (req) => {
      log.debug(EXT_EVENTS.GET_CONSTANTS);
      getConstants(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.JOIN_ROOM, (req) => {
      log.debug(EXT_EVENTS.JOIN_ROOM);
      joinRoom(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.LEAVE_ROOM, (req) => {
      log.debug(EXT_EVENTS.LEAVE_ROOM);
      leaveRoom(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.CREATE_IDEA, (req) => {
      log.debug(EXT_EVENTS.CREATE_IDEA);
      createIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DESTROY_IDEA, (req) => {
      log.debug(EXT_EVENTS.DESTROY_IDEA);
      destroyIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.GET_IDEAS, (req) => {
      log.debug(EXT_EVENTS.GET_IDEAS);
      getIdeas(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.CREATE_COLLECTION, (req) => {
      log.debug(EXT_EVENTS.CREATE_COLLECTION);
      createCollection(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DESTROY_COLLECTION, (req) => {
      log.debug(EXT_EVENTS.DESTROY_COLLECTION);
      destroyCollection(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.ADD_IDEA, (req) => {
      log.debug(EXT_EVENTS.ADD_IDEA);
      addIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.REMOVE_IDEA, (req) => {
      log.debug(EXT_EVENTS.REMOVE_IDEA);
      removeIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.GET_COLLECTIONS, (req) => {
      log.debug(EXT_EVENTS.GET_COLLECTIONS);
      getCollections(_.merge({socket: socket}, req));
    });
  });

  stream.on(INT_EVENTS.BROADCAST, (req) => {
    log.info(INT_EVENTS.BROADCAST, req.event, req.boardId);
    io.in(req.boardId).emit(req.event, req.res);
  });

  stream.on(INT_EVENTS.EMIT_TO, (req) => {
    log.info(INT_EVENTS.EMIT_TO, req.event, req.socket.id);
    io.to(req.socket.id).emit(req.event, req.res);
  });

  stream.on(INT_EVENTS.JOIN, (req) => {
    log.info(INT_EVENTS.JOIN, req.boardId);
    req.socket.join(req.boardId);
  });

  stream.on(INT_EVENTS.LEAVE, (req) => {
    log.info(INT_EVENTS.LEAVE, req.boardId);
    req.socket.leave(req.boardId);
  });
};

export default dispatcher;
