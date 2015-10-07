const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

var uuid;
var userSocketId;
var roomId;

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/createUser', function(response) {

	console.log('Client: ' + response.message);

	uuid = response.uuid;
	userSocketId = response.userSocketId;
	console.log('response.userSocketId has value: ' + userSocketId);

	io.socket.get('/room/createRoom?socketId=' + userSocketId, function(response) {

		console.log('Client: ' + response.message);
        roomId = response.roomId;
	});
});

/* test joining
io.socket.post('/joinRoom', {'roomId': roomId, 'userId': uuid}, function(data, jwres){
 
  console.log(data);
});
*/

io.socket.on('roomJoined', function(data) {

	console.log(data.message);
});

io.socket.on('room', function(data) {
  
  console.log("room updated!");
});