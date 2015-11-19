const expect = require('chai').expect;
const _ = require('lodash');

const BoardService = require('../../../api/services/BoardService.js');

/**
* Given an association name, return a promise that creates a model to use
*/
const createModelBasedOnString = (assoc) => {
  if (_.some(['users', 'admins', 'pendingUsers'], (el) => el === assoc)) {
    return User.create({isFullAccount: false, username: 'brax'});
  }
  else if (assoc === 'ideas') {
    return Idea.create({content: 'Blah'});
  }
  else if (assoc === 'ideaCollections') {
    return IdeaCollection.create({weight: 1});
  }
};

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

  describe('Add and remove associations', () => {
    // Since add and remove are all doing the same thing, no need to duplicate
    // the tests, just dynamically run them.
    [ {assoc: 'users'},
      {assoc: 'pendingUsers'},
      {assoc: 'admins'},
      {assoc: 'ideas'},
      {assoc: 'ideaCollections'},
    ].forEach((obj) => {
      const assoc = obj.assoc;

      describe(`#addTo ${assoc}()`, () => {

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
            return BoardService.addTo([assoc], firstBoard.boardId, newCollection.id);
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

      describe(`#removeFrom ${assoc}()`, () => {

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
            return BoardService.addTo([assoc], firstBoard.boardId, newCollection.id);
          })
          .then((board) => {
            return BoardService.removeFrom([assoc], firstBoard.boardId,
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
  });

  describe('#destroy()', () => {

    xit('Should destroy a board', (done) => {

      Board.find().then((boards) => {
        const firstBoard = boards[0];

        BoardService.destroy(firstBoard.boardId)
          .then(() => {

            done();
          });
      })
      .catch(done);
    });
  });

  describe('findBoard()', () => {

    it('Should return the board found with given boardId', (done) => {

      Board.create({isPublic: true})
        .then((found) => BoardService.findBoard(found.boardId))
        .then((foundBoard) => {

          expect(foundBoard.isPublic).to.be.a('boolean');
          expect(foundBoard.boardId).to.be.a('string');

          done();
        })
        .catch(done);
    });
  });

  describe('findBoardAndPopulate()', () => {

    xit('Should return the board found with given boardId and populated association', (done) => {

      BoardService.findBoardAndPopulate('xyz123', 'ideas')
        .then(() => {
          done();
        })
        .catch(done);
    });
  });

  describe('getIdeas()', () => {

    it('Should get all of the ideas on a board', (done) => {

      Board.create({isPublic: true})
        .then((board) => {
          return Idea.create({content: 'purple'})
            .then((idea) => {
              return BoardService.addTo('ideas', board.boardId, idea.id);
            });
        })
        .then((created) => BoardService.getIdeas(created.boardId))
        .then((ideas) => {

          expect(ideas.length).to.equal(1);
          done();
        })
        .catch(done);
    });
  });

  describe('getIdeaCollections()', () => {

    it('Should get all of the idea collections and their ideas', (done) => {

      Idea.create({content: 'purple'})
        .then((idea) => IdeaCollection.create({weight: 1, ideas: [idea]}))
        .then((collection) => Board.create({isPublic: true, ideaCollections: [collection]}))
        .then((created) => BoardService.getIdeaCollections(created.boardId))
        .then((ideaCollections) => {
          expect(ideaCollections.length).to.equal(1);
          done();
        })
        .catch(done);
    });
  });
});
