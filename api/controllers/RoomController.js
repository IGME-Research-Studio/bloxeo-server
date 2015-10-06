/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// ToDo: Test responses from this and figure out how to send response to render view instead of just json responses

module.exports = {

  createRoom: function(req, res) {

  	var userSocketId = req.query.socketId;
  	console.log('RoomController userSocketId has value: ' + userSocketId);

    Room.create({}).exec(function(err, created) {

      var roomId = created.roomId;

      res.json({

        message: 'Server: Room created with room id: ' + roomId,
      });

      //User.findOne({id: userId}).exec(function(err, found) {

      	//console.log('Found user with uuid: ' + userId);  
      	sails.sockets.join(userSocketId, roomId);

      	sails.sockets.broadcast(roomId, 'roomJoined', {message: 'User with socket id: ' + userSocketId + 'has joined the room!'});   	
     // });

      //sails.sockets.join(req.socket, roomId);
      //console.log('Server: Socket ' + req.socket + ' joined room ' + roomId);
    });
  },

/*  joinRoom: function(req, res) {

    const roomId = req.param('roomId');
    const userId = req.param('userId');

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Only a client socket can subscribe to Louies.  You, sir, appear to be something... _else_.');
    }

    sails.sockets.join(req.socket, roomId);

    roomModel.subscribe(req, [roomId]);

    res.json({

      message: 'User ' + userId + ' subscribed to: ' + roomId,
    });
  },*/
};