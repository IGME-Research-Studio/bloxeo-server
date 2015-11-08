/**
* /v1/room/join
*
* @description :: Server-side logic for destroying boards
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

import BoardService from '../services/BoardService';
import valid from '../services/ValidatorService';
import EVENT_API from '../constants/EVENT_API';

export default function join(data) {
  const userSocketId = req.socket;
  const boardId = req.param('boardId');

  sails.sockets.join(userSocketId, boardId);
  sails.sockets.broadcast(boardId, EVENT_API.JOINED_ROOM, {
    message: `User with socket id ${userSocketId.id} joined board ${boardId}`,
  });
};
