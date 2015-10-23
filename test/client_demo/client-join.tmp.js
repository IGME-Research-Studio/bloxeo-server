const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

//var uuid;
var boardId = process.env.BOARD_ID || 'V12Nds7be';

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/create', {isFullAccount: false, username: 'braxtoniskewl'}, function(response) {

    io.socket.post('/board/join', {boardIdentifier: boardId}, function(data, jwres){

      console.log(data);
      
      io.socket.post('/idea/create', {isFullAccount: false, user: 'braxtoniskewl', content: 'dogs in space', boardId: boardId}, function(response){

        console.log(response);
        io.socket.post('/idea/create', {isFullAccount: false, user: 'braxtoniskewl', content: 'dogs in space', boardId: boardId}, function(response){

          console.log(response);
        });
      });
    });
});

io.socket.on('boardJoined', function(data) {

	console.log(data.message);
});

io.socket.on('board', function(data) {

  console.log("board updated!");
});

io.socket.on('ideaCreated', function(data){
  
  console.log("idea created");
  console.log(data);
  io.socket.post('/idea/delete', {boardId: boardId, ideaId: data.id}, function(response){

    console.log("delete");
    console.log(response);
  });
});