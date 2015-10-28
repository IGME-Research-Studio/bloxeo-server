const expect = require('chai').expect;
const BoardService = require('../../../api/services/BoardService.js');
const IdeaCollectionService = require('../../../api/services/IdeaCollectionService.js');

/**
* Create an Idea Collection given a boardId, userId, and IdeaID
*/
describe('IdeaCollectionService', function() {

  describe('#create()', () => {

    it('Should create an Idea Collection', (done) => {

      // Create a Board
      BoardService.create({isPublic: true})

      .then((board) => {

        // Create a User
        User.create({isFullAccount: false, username: 'brax2themax'})

        .then((user) => {

          // Create an Idea
          Idea.create({content: 'purple'})

          .then((idea) => {

            return IdeaCollectionService.create(board.boardId, user.id, idea.id);
          })

          .then((collectionIndex) => {

            expect(collectionIndex).to.be.a('number');

            done();
          })

          .catch(done);
        });
      });
    });
  });
});
