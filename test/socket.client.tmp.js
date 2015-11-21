var _ = require('lodash');
var io = require('socket.io-client');
var socketURL = 'http://0.0.0.0:1337' || process.env.URL;
var EVENT_API = require('../api/constants/EXT_EVENT_API');

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var boardId = 'NJfCalyXe' || process.env.BOARD_ID;
var client1 = io.connect(socketURL, options);

client1.on('connect', function() {
  console.log('connected');

  // client1.emit('GET_CONSTANTS');
  client1.emit('JOIN_ROOM', {boardId: boardId});
  // client1.emit('GET_COLLECTIONS', {boardId: boardId});
  // client1.emit('GET_IDEAS', {boardId: boardId});
  //
  // client1.emit('CREATE_IDEA', {boardId: boardId, content: 'will'});
  // client1.emit('CREATE_IDEA', {boardId: boardId, content: 'ill'});
  // client1.emit('CREATE_IDEA', {boardId: boardId, content: 'peter'});
  // client1.emit('DESTROY_IDEA', {boardId: boardId, content: 'blah4'});

  client1.emit('CREATE_COLLECTION', {boardId: boardId, content: 'blah2'});
  // client1.emit('REMOVE_IDEA', {boardId: boardId, content: 'blah2', index: 0});
  // client1.emit('DESTROY_COLLECTION', {boardId: boardId, index: 0});
});

_.keys(EVENT_API).forEach(function(event) {
  client1.on(event, function(data) {
    console.log(event, data);
  });
});

client1.on('error', function(err) {
  console.error(err);
});
