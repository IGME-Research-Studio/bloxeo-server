/**
 * Dispatcher
 *
 */

import sio from 'socket.io';
import _ from 'lodash';
import log from 'winston';

import stream from './event-stream';
import events from './events';
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

  io.on('connection', function(socket) {
    log.info(`User with ${socket.id} has connected`);

    _.forEach(events, (method, event) => {
      log.info(event, method.name);
      socket.on(event, (req) => {
        log.info(event, req);
        method(_.merge({socket: socket}, req));
      });
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
};

export default dispatcher;
