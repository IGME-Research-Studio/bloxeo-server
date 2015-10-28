const expect = require('chai').expect;
// const _ = require('lodash');

const BoardService = require('../../../api/services/BoardService.js');

/**
* Given an association name, return a promise that creates a model to use
*/
/* const createModelBasedOnString = (assoc) => {
  if (_.some(['users', 'admins', 'pendingUsers'], (el) => el === assoc)) {
    return User.create({isFullAccount: false, username: 'brax'});
  }
  else if (assoc === 'ideas') {
    return Idea.create({content: 'Blah'});
  }
  else if (assoc === 'collections') {
    return IdeaCollection.create({weight: 1});
  }
};*/

describe('BoardService', function() {

  describe('#create()', () => {

    it('Should create a board', (done) => {

      BoardService.create({isPublic: true})

      .then((board) => {

        expect(board.isPublic).to.be.a('boolean');
        expect(board.boardId).to.be.a('string');

        done();
      })

      .catch(done);
    });
  });

/*  describe('Add and remove associations', () => {
    // Since add and remove are all doing the same thing, no need to duplicate
    // the tests, just dynamically run them.
    [ {assoc: 'users', add: 'addUser', remove: 'removeUser'},
      {assoc: 'pendingUsers', add: 'addPendingUser', remove: 'removePendingUser'},
      {assoc: 'admins', add: 'addAdmin', remove: 'removeAdmin'},
      {assoc: 'ideas', add: 'addIdea', remove: 'removeIdea'},
      {assoc: 'collections', add: 'addIdeaCollection', remove: 'removeIdeaCollection'},
    ].forEach((obj) => {
      const assoc = obj.assoc;
      const add = obj.add;
      const remove = obj.remove;

      describe(`#${add}()`, () => {

        it(`Should add ${assoc} to a board`, (done) => {
          let firstBoard;
          let numModel;

          Board.find().limit(1)
          .then((boards) => {
            firstBoard = boards[0];
            numModel = firstBoard[assoc].length;

            return createModelBasedOnString(assoc);
          })
          .then((newCollection) => {
            return BoardService[add](firstBoard.boardId, newCollection.id);
          })
          .then(() => {
            return BoardService.findBoardAndPopulate(firstBoard.boardId, assoc);
          })
          .then((resModel) => {
            expect(resModel[assoc].length).to.equal(numModel + 1);
            done();
          })
          .catch(done);
        });
      });

      describe(`#${remove}()`, () => {

        it(`Should remove ${assoc} from a board`, function(done) {
          let firstBoard;
          let numModel;

          Board.find().limit(1).populate(assoc)
          .then((boards) => {
            firstBoard = boards[0];
            numModel = firstBoard[assoc].length;

            return createModelBasedOnString(assoc);
          })
          .then((newCollection) => {
            return BoardService[add](firstBoard.boardId, newCollection.id);
          })
          .then((board) => {
            return BoardService[remove](firstBoard.boardId,
                                        _.last(board[assoc]).id);
          })
          .then((board) => {
            expect(board[assoc].length).to.equal(numModel);
            done();
          })
          .catch(done);
        });
      });
    });
  });*/

  describe('#destroy()', () => {

    it('Should destroy a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        BoardService.destroy(firstBoard.boardId);

        done();
      })

      .catch(done);
    });
  });

  describe('findBoard()', () => {

    it('Should return the board found with given boardId', (done) => {

      Board.create({isPublic: true})

      .then((found) => {

        BoardService.findBoard(found.boardId)

        .then((foundBoard) => {

          expect(foundBoard.isPublic).to.be.a('boolean');
          expect(foundBoard.boardId).to.be.a('string');

          done();
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('findBoardAndPopulate()', () => {

    it('Should return the board found with given boardId and populated association', (done) => {

      Board.create({isPublic: true})

      .then((found) => {

        BoardService.findBoardAndPopulate(found.boardId, 'users')

        .then(() => {

          done();
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('getIdeaCollections()', () => {

    it('Should get all of the idea collections and their ideas', (done) => {

      Idea.create({content: 'purple'})

      .then((idea) => {

        IdeaCollection.create({weight: 1, ideas: [idea]})

        .then((collection) => {

          Board.create({isPublic: true, collections: [collection]})

          .then((created) => {

            // console.dir(created);
            BoardService.getIdeaCollections(created.boardId)

            .then((ideaCollections) => {
              console.log('IN TEST');
              console.log(ideaCollections);

              done();
            })

            .catch(done);
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });
});
