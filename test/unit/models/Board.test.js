const expect = require('chai').expect;
const should = require('chai').should();

describe('BoardModel', () => {
  let testBoardId = '';
  describe('#create()', () => {

    it('Should create a Board', (done) => {

      Board.create({

        boardId: 'abc123',
        isPublic: true,
        // owner: 10,
      })

      .then((board) => {
        testBoardId = board.boardId;
        expect(board.boardId).to.be.a('string');

        done();
      })

      .catch(done);
    });

    it('Should not create an incomplete Board', (done) => {

      Board.create({

        boardId: 'abc124',
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

      .then((boards) => {

        for (let i = 0; i < boards.length; i++) {
          expect(boards[i].boardId).to.be.a('string');
        }

        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update a Board', (done) => {

      Board.update({boardId: testBoardId}, {boardId: 'abc12345'})

      .then((boards) => {
        expect(boards[0].boardId).to.equal('abc12345');
        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy a Board', (done) => {

      Board.destroy({boardId: 'abc12345'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
