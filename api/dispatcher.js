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
import startTimerCountdown from './handlers/v1/timer/start';
import disableTimer from './handlers/v1/timer/stop';

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
    log.info(`User with ${socket.id} has connected`);

    socket.on(EXT_EVENTS.GET_CONSTANTS, (req) => {
      log.verbose(EXT_EVENTS.GET_CONSTANTS, req);
      getConstants(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.JOIN_ROOM, (req) => {
      log.verbose(EXT_EVENTS.JOIN_ROOM, req);
      joinRoom(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.LEAVE_ROOM, (req) => {
      log.verbose(EXT_EVENTS.LEAVE_ROOM, req);
      leaveRoom(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.CREATE_IDEA, (req) => {
      log.verbose(EXT_EVENTS.CREATE_IDEA, req);
      createIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DESTROY_IDEA, (req) => {
      log.verbose(EXT_EVENTS.DESTROY_IDEA, req);
      destroyIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.GET_IDEAS, (req) => {
      log.verbose(EXT_EVENTS.GET_IDEAS, req);
      getIdeas(_.merge({socket: socket}, req));
    });

    socket.on(EXT_EVENTS.CREATE_COLLECTION, (req) => {
      log.verbose(EXT_EVENTS.CREATE_COLLECTION, req);
      createCollection(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DESTROY_COLLECTION, (req) => {
      log.verbose(EXT_EVENTS.DESTROY_COLLECTION, req);
      destroyCollection(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.ADD_IDEA, (req) => {
      log.verbose(EXT_EVENTS.ADD_IDEA, req);
      addIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.REMOVE_IDEA, (req) => {
      log.verbose(EXT_EVENTS.REMOVE_IDEA, req);
      removeIdea(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.GET_COLLECTIONS, (req) => {
      log.verbose(EXT_EVENTS.GET_COLLECTIONS, req);
      getCollections(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.START_TIMER, (req) => {
      log.verbose(EXT_EVENTS.START_TIMER, req);
      startTimerCountdown(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.DISABLE_TIMER, (req) => {
      log.verbose(EXT_EVENTS.DISABLE_TIMER, req);
      disableTimer(_.merge({socket: socket}, req));
    });
    socket.on(EXT_EVENTS.ENABLED_IDEAS, (req) => {

    });
    socket.on(EXT_EVENTS.DISABLED_IDEAS, (req) => {

    });
    socket.on(EXT_EVENTS.FORCED_VOTE, (req) => {

    });
    socket.on(EXT_EVENTS.FORCED_RESULTS, (req) => {

    });
    socket.on(EXT_EVENTS.TIMER_EXPIRED, (req) => {

    });
    socket.on(EXT_EVENTS.FINISHED_VOTING, (req) => {

    });
  });

  stream.on(INT_EVENTS.BROADCAST, (req) => {
    log.info(INT_EVENTS.BROADCAST, req.event);
    log.info('\t', JSON.stringify(req.res, null, 2));
    io.in(req.boardId).emit(req.event, req.res);
  });

  stream.on(INT_EVENTS.EMIT_TO, (req) => {
    log.info(INT_EVENTS.EMIT_TO, req.event);
    log.info('\t', JSON.stringify(req.res, null, 2));
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
  // put custom event logic here for timer and state service
};

export default dispatcher;
