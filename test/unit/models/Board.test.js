const expect = require('chai').expect;
const should = require('chai').should();

describe('BoardModel', () => {

  describe('#create()', () => {

    it('Should create a Board', (done) => {

      Board.create({

        roomId: 'abc123',
        isPublic: true,
        owner: 10,
      })

      .then((board) => {

        expect(board.roomId).to.be.a('string');

        done();
      })

      .catch(done);
    });

    it('Should not create an incomplete Board', (done) => {

      Board.create({

        roomId: 'abc124',
      })

      .exec(function(err, board) {

        should.exist(err);
        should.not.exist(board);

        done();
      });
    });
  });

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      Board.find()

      .then((rooms) => {

        for (let i = 0; i < rooms.length; i++) {
          expect(rooms[i].roomId).to.be.a('string');
        }

        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update a Board', (done) => {

      Board.update({roomId: 'abc123'}, {roomId: 'abc12345'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy a Board', (done) => {

      Board.destroy({roomID: 'abc12345'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
