const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

var uuid;
var userSocketId;
var roomId;

io.sails.url = 'http://localhost:1337';

// test creating a user
io.socket.post('/user/createUser', function(response) {

	console.log('Client: ' + response.message);

	uuid = response.uuid;

	// test creating a room
	io.socket.post('/createRoom', function(response) {

		console.log(response.message);
        roomId = response.roomId;

        // test leaving a room
		io.socket.post('/leaveRoom', {roomIdentifier: roomId}, function(response) {

			console.log(response.message);
		});

		// test rejoining a room after leaving
		io.socket.post('/joinRoom', {roomIdentifier: roomId}, function(data, jwres){
 
  			console.log(data);
		});
	});
});

io.socket.on('roomJoined', function(data) {

	console.log(data.message);
});

io.socket.on('room', function(data) {
  
  console.log("room updated!");
});