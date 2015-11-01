const socketIOClient = require('socket.io-client');
const sailsIOClient = require('sails.io.js');
const Promise = require('bluebird');

var io = sailsIOClient(socketIOClient);

//var uuid;
var boardId;

io.sails.url = process.env.URL || 'http://localhost:1337';

io.socket.get('/v1/boards', function(res, jwr) {
    console.log(res, jwr)
  });

// // test creating a user
// io.socket.post('/user/create', {isFullAccount: false, username: 'braxtoniskewl'}, function(response) {
//
//   //uuid = response.uuid;
//
//   // test creating a room
//   io.socket.post('/board/create', {isPublic: true}, function(response) {
//
//     //console.log(response.message);
//     var boardId = response.boardId;
//
//     // test leaving a room
//     io.socket.post('/board/' + boardId + '/leave', function(response) {
//
//       console.log(response.message);
//     });
//
//     // test rejoining a room after leaving
//     io.socket.post('/board/' + boardId + '/join', function(data, jwres) {
//
//       console.log(data);
//     });
//
//     // add a user to the board
//     // io.socket.post('/board/addUser', {})
//   });
// });
//
io.socket.on('boardJoined', function(data) {

  console.log('socket.on');
  console.log(data.message);
});

io.socket.on('board', function(data) {

  console.log("board updated!");
});
