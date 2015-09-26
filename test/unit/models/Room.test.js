const expect = require('chai').expect;

describe('RoomModel', () => {

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      Room.find()

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#create()', () => {

    it('Should create a Room', (done) => {

      Room.create({

        roomID: 'abc123',
      })

      .then((room) => {

        expect(room.roomId).to.be.a('string');

        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update a Room', (done) => {

      Room.update({roomID: 'abc123'}, {roomID: 'abc12345'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy a Room', (done) => {

      Room.destroy({roomID: 'abc12345'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
