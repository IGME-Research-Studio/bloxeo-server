const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

var uuid;
var userSocketId;
var roomId = "NyreUFRke";

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/createUser', function(response) {

	console.log('Client: ' + response.message);

	uuid = response.uuid;
	userSocketId = response.userSocketId;
	console.log('response.userSocketId has value: ' + userSocketId);
    
    io.socket.post('/joinRoom', {roomId: roomId, userId: userSocketId}, function(data, jwres){

      console.log(data);
    });
});

io.socket.on('roomJoined', function(data) {

	console.log(data.message);
});

io.socket.on('room', function(data) {
  
  console.log("room updated!");
});