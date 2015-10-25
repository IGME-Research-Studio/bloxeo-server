const expect = require('chai').expect;

const boardService = require('../../../api/services/BoardService.js');

describe('BoardService', () => {

  describe('#create()', () => {

    it('Should create a board', (done) => {

      boardService.create({isPublic: true})

      .then((board) => {

        expect(board.isPublic).to.be.a('boolean');
        expect(board.boardId).to.be.a('string');

        done();
      })

      .catch(done);
    });
  });

  describe('#addUser()', () => {

    it('Should add a user to a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        User.create({isFullAccount: false, username: 'braxtonissokewl'})

        .then((user) => {

          console.log(firstBoard.boardId);
          console.dir(user);
          console.log(user.id);

          boardService.addUser(firstBoard.boardId, user.id)

          .then((saved) => { // THIS .THEN IS APPARENTLY NOT WORKING

            console.log('entered .then from boardService.addUser'); // never fires
            console.dir(saved);

            done();
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        boardService.destroy(firstBoard.boardId);

        done();
      })

      .catch(done);
    });
  });
});
