const _ = require('lodash');
const io = require('socket.io-client');
const socketURL = 'http://0.0.0.0:1337' || process.env.URL;
const EVENT_API = require('./api/constants/EXT_EVENT_API');

const options ={
  transports: ['websocket'],
  'force new connection': true
};

const boardId = process.env.BOARD_ID || 'V1kD7FxeZ';
const userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfX3YiOjAsInVzZXJuYW1lIjoiZXJpYyIsIl9pZCI6IjU3MTc5MzZhMGNjNzMxOTAxZGRiNGQ5OCIsImlhdCI6MTQ2MTE2Mjg1OH0.V0ObO1WR4FKwUO8wMjLdNHJMucZ7i6eq0RF81UMZ_rI';
const client1 = io.connect(socketURL, options);
const ideaContent = 'billy';

client1.on('connect', function() {
  console.log('connected');

  // client1.emit('GET_CONSTANTS');
  // Make a User and a Board through Postman
  // Assign the userToken and boardId to the variables above
  client1.emit('JOIN_ROOM', {boardId: boardId, userToken: userToken});
  // client1.emit('START_TIMER', {boardId: boardId, timerLengthInMS: '200000', userToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiaW5zZXJ0aW5nIjp0cnVlLCJnZXR0ZXJzIjp7fSwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsidXNlcm5hbWUiOiJyZXF1aXJlIn0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6e30sIm1vZGlmeSI6e30sInJlcXVpcmUiOnsidXNlcm5hbWUiOnRydWV9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sImVtaXR0ZXIiOnsiZG9tYWluIjpudWxsLCJfZXZlbnRzIjp7fSwiX2V2ZW50c0NvdW50IjowLCJfbWF4TGlzdGVuZXJzIjowfX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfaWQiOiI1NmFlODc4ODRhY2VmMTg1NTk0ZWJlMjEiLCJ1c2VybmFtZSI6Iidlcmlja2lwbmlzJyIsIl9fdiI6MH0sIl9wcmVzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltudWxsLG51bGxdfSwiX3Bvc3RzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltdfSwiaWF0IjoxNDU0Mjc4NTM2fQ.niqGXAIwQCW1frf7yDXRJiPEZ_SG8f5K1PoP-RZWr6U"});
  //client1.emit('GET_TIME', {boardId: boardId, userToken: 'abc123'});
  //client1.emit('DISABLE_TIMER', {boardId: boardId, eventId: 71});
  // client1.emit('GET_COLLECTIONS', {boardId: boardId});
  // client1.emit('GET_IDEAS', {boardId: boardId});

  //client1.emit('CREATE_IDEA', {boardId: boardId, content: 'ian sucks dick'});
  client1.emit('CREATE_IDEA', {boardId: boardId, content: ideaContent, userToken: userToken});
  // //client1.emit('CREATE_IDEA', {boardId: boardId, content: 'peter loves will'});
  // //client1.emit('CREATE_IDEA', {boardId: boardId, content: 'rules 8 8 8'});
  // //setTimeout(client1.emit.bind(this, 'DESTROY_IDEA', {boardId: boardId, content: 'blah4'}), 4000);
  //
  client1.emit('CREATE_COLLECTION', {boardId: boardId, content: ideaContent, top: 50, left: 50, userToken: userToken});
  // //client1.emit('ADD_IDEA', {boardId: boardId, content: 'ill', index: 0});
  // //client1.emit('ADD_IDEA', {boardId: boardId, content: 'ill', index: 0});
  // //client1.emit('REMOVE_IDEA', {boardId: boardId, content: 'ill', key: 'V1IlE1T8sQe'});
  // client1.emit('ADD_IDEA', {boardId: boardId, content: 'billy', key: 'NJhPuTM4x'});
  // //client1.emit('ADD_IDEA', {boardId: boardId, key: 'V1IlE1T8sQe', content: 'ill'});
  // //client1.emit('DESTROY_COLLECTION', {boardId: boardId, key: 'ill'});
  // //client1.emit('DESTROY_COLLECTION', {boardId: boardId, index: 0});
  client1.emit('READY_USER', {boardId: boardId, userToken: userToken});
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
