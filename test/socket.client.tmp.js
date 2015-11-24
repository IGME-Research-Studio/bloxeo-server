var _ = require('lodash');
var io = require('socket.io-client');
var socketURL = 'http://0.0.0.0:1337' || process.env.URL;
var EVENT_API = require('../api/constants/EXT_EVENT_API');

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var boardId = process.env.BOARD_ID || 'NJfCalyXe';
var client1 = io.connect(socketURL, options);

client1.on('connect', function() {
  console.log('connected');

  client1.emit('GET_CONSTANTS');
  client1.emit('JOIN_ROOM', {boardId: boardId});
  client1.emit('GET_COLLECTIONS', {boardId: boardId});
  // client1.emit('GET_IDEAS', {boardId: boardId});

  // client1.emit('CREATE_IDEA', {boardId: boardId, content: 'ian sucks dick'});
  // client1.emit('CREATE_IDEA', {boardId: boardId, content: 'peter loves will'});
  // client1.emit('CREATE_IDEA', {boardId: boardId, content: 'rules 8 8 8'});
  // setTimeout(client1.emit.bind(this, 'DESTROY_IDEA', {boardId: boardId, content: 'blah4'}), 4000);

  // client1.emit('CREATE_COLLECTION', {boardId: boardId, content: 'ian sucks dick'});
  // client1.emit('ADD_IDEA', {boardId: boardId, content: 'ill', index: 0});
  // client1.emit('REMOVE_IDEA', {boardId: boardId, content: 'ill', key: 'V1IlE1T8sQe'});
  // client1.emit('ADD_IDEA', {boardId: boardId, content: 'ill', key: 'V1IlE1T8sQe'});
  // client1.emit('DESTROY_COLLECTION', {boardId: boardId, key: 'ill'});
  // client1.emit('DESTROY_COLLECTION', {boardId: boardId, index: 0});
});

_.keys(EVENT_API).forEach(function(event) {
  client1.on(event, function(data) {
    console.log(event, JSON.stringify(data, null, '  '));
    // console.log(event, data);
  });
});

client1.on('error', function(err) {
  console.error(err);
});
