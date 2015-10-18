const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

//var uuid;
var boardId;

io.sails.url = 'http://localhost:1337';

  // test creating a user
  io.socket.post('/user/create', {isFullAccount: false, username: 'braxtoniskewl'}, function(response) {

  //uuid = response.uuid;

  // test creating a room
  io.socket.post('/board/create', {isPublic: true}, function(response) {

    //console.log(response.message);
    boardId = response.boardId;

    // test leaving a room
    io.socket.post('/board/leave', {boardIdentifier: boardId}, function(response) {

      console.log(response.message);
    });

    // test rejoining a room after leaving
    io.socket.post('/board/join', {boardIdentifier: boardId}, function(data, jwres){

      console.log(data);
    });
  });
});

io.socket.on('boardJoined', function(data) {

  console.log(data.message);
});

io.socket.on('board', function(data) {

  console.log("board updated!");
});