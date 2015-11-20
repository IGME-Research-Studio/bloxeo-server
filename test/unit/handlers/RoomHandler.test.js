// import { expect } from 'chai';
import io from 'socket.io-client';
// import app from '../../../api/app';

const socketURL = 'http://0.0.0.0:1337';
const options = {
  transports: ['websocket'],
  'force new connection': true,
};

describe('RoomHandler', () => {
  let client1;
  let client2;

  beforeEach((done) => {
    client1 = io.connect(socketURL, options);
    client2 = io.connect(socketURL, options);

    client1.on('connect', function() {
      console.log('connected-1');
    });

    client2.on('connect', function() {
      console.log('connected-2');
      done();
    });
  });

  it('should join the socket to a room', (done) => {
    client1.emit('JoinRoom', 'some-board');
    client2.emit('JoinRoom', 'some-board');
    done();
  });

  afterEach(() => {
    client1.disconnect();
  });
});
