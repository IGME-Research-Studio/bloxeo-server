/**
* /v1/room/leave
*
* @description :: Server-side logic for destroying boards
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

import BoardService from '../services/BoardService';
import valid from '../services/ValidatorService';
import EVENT_API from '../constants/EVENT_API';

export default function leave(data) {
  const userSocketId = req.socket;
  const boardId = req.param('boardId');

  sails.sockets.leave(userSocketId, boardId);
  sails.sockets.broadcast(boardId, EVENT_API.LEFT_ROOM, {
    message: `User with socket id ${userSocketId.id} left board ${boardId}`,
  });
};
