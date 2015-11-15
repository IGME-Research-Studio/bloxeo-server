import socket from 'socket.io';
import socketioJwt from 'socketio-jwt';

import CFG from './config';

export default function(server) {
  const io = socket(server);

  io.on('connection', function(socket) {
    console.log('user connected');
  });

  /**
   * In the future we will authenticate all communication within a room w/JWT
   * CFG.jwt has a secret string and a timeout period for auth.
   *
   * @todo Implement a JWT token service so that client can actually get tokens
   *
   * @example Client code for using this authorization:
   *
   * socket.of('/rooms', function(socket) {
   *   socket.on('authenticated', function () {
   *      // do other things
   *    })
   *    // send the jwt, stored in retrieved from the server or stored in LS
   *    .emit('authenticate', {token: jwt});
   *  })
   */
  io.of('/rooms')
    .on('connection', socketioJwt.authorize(CFG.jwt));

  io.on('authenticated', function(socket) {
      console.log(socket.decoded_token);
    });

  return io;
}

