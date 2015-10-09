const expect = require('chai').expect;
const should = require('chai').should();

describe('RoomModel', () => {

  describe('#create()', () => {

    it('Should create a Room', (done) => {

      Room.create({

        roomId: 'abc123',
        isPublic: true,
        owner: 10,
      })

      .then((room) => {

        expect(room.roomId).to.be.a('string');

        done();
      })

      .catch(done);
    });
    
    it('Should not create an incomplete Room', (done) => {

      Room.create({

        roomId: 'abc124',
      })

      .exec(function(err, room) {

        should.exist(err);
        should.not.exist(room);

        done();
      });
    });
  });
  
  describe('#find()', () => {

    it('Should check the find function', (done) => {

      Room.find()

      .then((rooms) => {

        for(var i=0; i < rooms.length; i++){
          expect(rooms[i].roomId).to.be.a('string');
         }
      
        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update a Room', (done) => {

      Room.update({roomId: 'abc123'}, {roomId: 'abc12345'})

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
