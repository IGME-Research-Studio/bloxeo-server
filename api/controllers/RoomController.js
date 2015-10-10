/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  createRoom: function(req, res) {

  	var userSocketId = req.socket;
  	console.log('RoomController userSocketId has value: ' + userSocketId);

  	// cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Only a client socket can subscribe to Louies.  You, sir, appear to be something... _else_.');
    }

    Room.create({}).exec(function(err, created) {

      var roomId = created.roomId;

      res.json({

        message: 'Server: Room created with room id: ' + roomId,
        roomId: created.roomId,
      });

      sails.sockets.join(userSocketId, roomId);

      // subscribe the user to the room (works)
      Room.subscribe(req, [roomId]);
      Room.publishUpdate(roomId);

      sails.sockets.broadcast(roomId, 'roomJoined', {message: 'User with socket id: ' + userSocketId.id + ' has joined the room!'});   	
    });
  },  

  joinRoom: function(req, res) {

  	var userSocketId = req.socket;
    var roomId = req.body.roomIdentifier;

    // cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Only a client socket can subscribe to Louies.  You, sir, appear to be something... _else_.');
    }

    sails.sockets.join(userSocketId, roomId);

    sails.sockets.broadcast(roomId, 'roomJoined', {message: 'User with socket id: ' + userSocketId.id + ' has joined the room!'});

    Room.subscribe(req, [roomId]);

    res.json({
      message: 'User ' + userId + ' subscribed to: ' + roomId,
    });
  },

  leaveRoom: function(req, res) {

  	var userSocketId = req.socket;
  	var roomId = req.body.roomIdentifier;

  	// cannot subscribe if the request is not through socket.io
    if (!req.isSocket) {

      return res.badRequest('Only a client socket can subscribe to Louies.  You, sir, appear to be something... _else_.');
    }

  	sails.sockets.leave(userSocketId, roomId);

  	res.json({

  	  message: 'Server: User with socket id: ' + userSocketId.id + ' left room with room id: ' + roomId,
  	});
  },
};