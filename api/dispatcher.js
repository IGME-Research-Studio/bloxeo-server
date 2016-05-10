/**
 * Dispatcher
 */

import sio from 'socket.io';
import _ from 'lodash';
import log from 'winston';

import stream from './eventStream';
import events from './events';
import { BROADCAST, EMIT_TO, JOIN, LEAVE } from './constants/INT_EVENT_API';
import { handleLeaving } from './services/BoardService';

const dispatcher = function(server) {
  const io = sio(server, {
    origins: '*:*',
  });

  io.on('connection', function(socket) {
    log.info(`User with ${socket.id} has connected`);

    _.forEach(events, function(method, event) {
      socket.on(event, (req) => {
        log.info(event, req);
        method(_.merge({socket: socket}, req));
      });
    });

    socket.on('disconnect', function() {
      log.info(`User with ${socket.id} has disconnected`);

      handleLeaving(socket.id);
    });
  });

  /**
   * @param {Object} req should be of the form:
   * {event, boardId, res}
   */
  stream.on(BROADCAST, (req) => {
    log.info(BROADCAST, req.event);
    log.info('\t', JSON.stringify(req.res, null, 2));
    io.in(req.boardId).emit(req.event, req.res);
  });

  /**
   * @param {Object} req should be of the form:
   * {event, socket, res}
   */
  stream.on(EMIT_TO, (req) => {
    log.info(EMIT_TO, req.event);
    log.info('\t', JSON.stringify(req.res, null, 2));
    io.to(req.socket.id).emit(req.event, req.res);
  });

  /**
   * @param {Object} req should be of the form:
   * {boardId, userId, socket, res,
   *   cbRes: {event, res}}
   */
  stream.on(JOIN, (req) => {
    log.info(JOIN, req.boardId, req.userId);
    req.socket.join(req.boardId, function() {
      io.in(req.boardId).emit(req.cbRes.event, req.cbRes.res);
    });
  });

  /**
   * @param {Object} req should be of the form:
   * {boardId, userId, socket, res,
   *   cbRes: {event, res}}
   */
  stream.on(LEAVE, (req) => {
    log.info(LEAVE, req.boardId, req.userId);
    req.socket.leave(req.boardId, function() {
      io.in(req.boardId).emit(req.cbRes.event, req.cbRes.res);
    });
  });
};

export default dispatcher;
