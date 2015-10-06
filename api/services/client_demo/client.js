const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

var uuid;
var userSocketId;

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/createUser', function(response) {

	console.log('Client: ' + response.message);

	uuid = response.uuid;
	userSocketId = response.userSocketId;
	console.log('response.userSocketId has value: ' + userSocketId);

	io.socket.get('/room/createRoom?socketId=' + userSocketId, function(response) {

		console.log('Client: ' + response.message);
	});
});

io.socket.on('roomJoined', function(data) {

	console.log(data.message);
});