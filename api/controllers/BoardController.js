const roomModel = '../models/Room.js';
// const userModel = '../models/User.js';

/*
var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');

// Instantiate the socket client (`io`)
// (for now, you must explicitly pass in the socket.io client when using this library from Node.js)
var io = sailsIOClient(socketIOClient);
io.sails.url = 'http://localhost:1337';

/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// ToDo: Test responses from this and figure out how to send response to render view instead of just json responses

module.exports = {

  createRoom: function(req, res) {

    roomModel.create({}).exec(function(err, created) {

      res.json({

        message: 'Room created with room id: ' + created.roomId,
      });
    });
  },

  joinRoom: function(req, res) {

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
  },
};

/*
io.socket.get('/createRoom', function serverResponded(body, JWR) {
  // body === JWR.body
  console.log('Sails responded with: ', body);
  console.log('with headers: ', JWR.headers);
  console.log('and with status code: ', JWR.statusCode);
});