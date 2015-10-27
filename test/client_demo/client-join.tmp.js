const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

//var uuid;
var boardId = process.env.BOARD_ID || 'VyaaKaOWl';
var ideaId;

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/create', {isFullAccount: false, username: 'braxtoniskewl'}, function(response) {

    io.socket.post('/board/join', {boardIdentifier: boardId}, function(data, jwres){

      console.log(data);
      
      io.socket.post('board/'+boardId+'/idea/create', {isFullAccount: false, user: 'braxtoniskewl', content: 'dogs in space', boardId: boardId}, function(response){

        console.log('created');
        console.log(response);
        ideaId = response.ideaId;
        io.socket.post('board/'+boardId+'/idea/create', {isFullAccount: false, user: 'braxtoniskewl', content: 'dogs in the ocean', boardId: boardId}, function(response){

          io.socket.post('board/'+boardId+'/idea/delete', {boardId: boardId, ideaId: ideaId}, function(response){

            console.log("delete");
            console.log(response);
          });
          console.log(response.ideaId);
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

io.socket.on('UPDATED_IDEAS', function(data){
  
  console.log("idea created");
  console.log(data);
});