const expect = require('chai').expect;
const BoardService = require('../../../api/services/BoardService.js');
const IdeaCollectionService = require('../../../api/services/IdeaCollectionService.js');

/**
* Create an Idea Collection given a boardId, userId, and IdeaID
*/
describe('IdeaCollectionService', function() {

  describe('#create()', () => {

    xit('Should create an Idea Collection', (done) => {

      // Create a Board
      BoardService.create({isPublic: true})
      .then((board) => {
        return [
          board,
          User.create({isFullAccount: false, username: 'brax2themax'}),
        ];
      })
      .spread((user, board) => {
        return [
          board,
          user,
          Idea.create({content: 'purple'}),
        ];
      })
      .spread((board, user, idea) => {
          return [
            Board.find({boardId:boardId}).populate('ideaCollections'),
            IdeaCollectionService.create(board.boardId, user.id, idea.id),
          ];
      })
      .spread((board, collectionIndex) => {

          expect(collectionIndex).to.be.a('number');
          done();
      })
      .catch(done);
    });
  });

  describe('#addIdea()', () => {

    xit('Should add an idea to an idea collection', (done) => {

      // Create a Board
      BoardService.create({isPublic: true})

      .then((board) => {

        // Create a User
        User.create({isFullAccount: false, username: 'brax2themax'})

        .then((user) => {

          // Create an Idea
          Idea.create({content: 'will', board: board})
          .then(() => {
            return Idea.create({content: 'peter', board: board});
          })
          .then((idea) => {

            // Create an Idea Collection
            IdeaCollectionService.create(board.boardId, user.id, idea.id)

            .then((collectionIndex) => {

              IdeaCollectionService.addIdea(board.boardId, collectionIndex, 'will')

              .then(() => {

                done();
              })
              .catch(done);
            });
          });
        });
      });
    });
  });

  describe('#removeIdea()', () => {

    xit('Should remove an idea from an idea collection', (done) => {

      // Create a Board
      BoardService.create({isPublic: true})

      .then((board) => {

        // Create a User
        User.create({isFullAccount: false, username: 'brax2themax'})

        .then((user) => {

          // Create an Idea
          Idea.create({content: 'will', board: board})

          .then(() => {
            return Idea.create({content: 'peter', board: board});
          })
          .then((idea) => {

            // Create an Idea Collection
            IdeaCollectionService.create(board.boardId, user.id, idea.id)

            .then((collectionIndex) => {

              IdeaCollectionService.addIdea(board.boardId, collectionIndex, 'will')

              .then(() => {

                IdeaCollectionService.removeIdea(board.boardId, collectionIndex, 'will')

                .then(() => {

                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#destroy()', () => {

    xit('destroy an idea collection', (done) => {

      // Create a Board
      BoardService.create({isPublic: true})

      .then((board) => {

        // Create a User
        User.create({isFullAccount: false, username: 'brax2themax'})

        .then((user) => {

          // Create an Idea
          Idea.create({content: 'will', board: board})

          .then(() => {
            return Idea.create({content: 'peter', board: board});
          })
          .then((idea) => {

            // Create an Idea Collection
            IdeaCollectionService.create(board.boardId, user.id, idea.id)

            .then((collectionIndex) => {

              IdeaCollectionService.destroy(board.boardId, collectionIndex)

              .then(() => {

                done();
              })
              .catch(done);
            });
          });
        });
      });
    });
  });
});
