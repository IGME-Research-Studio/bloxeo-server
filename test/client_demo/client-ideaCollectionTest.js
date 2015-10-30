const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

const io = sailsIOClient(socketIOClient);

// var uuid;
const boardId = process.env.BOARD_ID || 'VyaaKaOWl';
let ideaId;

io.sails.url = 'http://localhost:1337';

io.socket.get('/user/create', {isFullAccount: false, username: 'braxtoniskewl'}, function(res) {
  console.log(res);
  io.socket.post('/board/join', {boardIdentifier: boardId}, function(data, jwres) {
    console.log(jwres);
    io.socket.post('board/' + boardId + '/ideaCollection/create', {isFullAccount: false, user: 'braxtoniskewl', ideaContent: 'dogs in space', boardId: boardId}, function(response) {

      console.log('created');
      console.log(response);
      console.log(response.index);
      ideaContent = response.content;
      io.socket.post('board/' + boardId + '/ideaCollection/add', {isFullAccount: false, user: 'braxtoniskewl', index: 0, ideaContent: 'dogs in the ocean', boardId: boardId}, function(response2) {
        console.log('added');
        console.log(response2);
        io.socket.post('board/' + boardId + '/ideaCollection/remove', { index: 0, ideaContent: 'poop', boardId: boardId, ideaId: ideaId}, function(response3) {

          console.log(response3);
          console.log(response3.content);
        });

      });
    });
  });
});

io.socket.on('boardJoined', function(data) {

  console.log(data.message);
});

io.socket.on('board', function(data) {
  console.log(data);
  console.log('board updated!');
});
/*
io.socket.on('UPDATED_IDEAS', function(data){

  console.log("idea created");
  console.log(data);
});
*/
