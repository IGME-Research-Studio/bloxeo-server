/**
 * Dispatcher
 */

import sio from 'socket.io';
import _ from 'lodash';
import log from 'winston';

import stream from './event-stream';
import events from './events';
import { BROADCAST, EMIT_TO, JOIN, LEAVE } from './constants/INT_EVENT_API';
import { getBoardForSocket, getUserFromSocket, removeUser,
  isRoomReadyToVote, isRoomDoneVoting } from './services/BoardService';

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

    io.on('disconnect', function() {
      const socketId = socket.id;
      let boardId;
      let userId;

      log.info(`User with ${socketId} has disconnected`);

      // Remove the socket/user from the board they were connected to in Redis
      return getBoardForSocket(socketId)
      .then((board) => {
        boardId = board.id;
        return getUserFromSocket(socketId);
      })
      .then((userIdFromSocket) => {
        userId = userIdFromSocket;
        return removeUser(boardId, userId, socketId);
      })
      .then(() => {
        // Check if the room is ready to vote or ready to finish voting
        return Promise.all([
          isRoomReadyToVote(boardId),
          isRoomDoneVoting(boardId),
        ]);
      });
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
