const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

//var uuid;
var boardId = process.env.BOARD_ID || 'NyreUFRke';

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/create', {isFullAccount: false, username: 'braxtoniskewl'}, function(response) {

    io.socket.post('/board/join', {boardIdentifier: boardId}, function(data, jwres){

      console.log(data);
    });
});

io.socket.on('boardJoined', function(data) {

	console.log(data.message);
});

io.socket.on('board', function(data) {

  console.log("board updated!");
});
