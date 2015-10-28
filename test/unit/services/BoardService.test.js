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

          boardService.addUser(firstBoard.boardId, user.id)

          .then(() => {

            done();
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('#removeUser()', () => {

    it('Should remove a user from a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        User.create({isFullAccount: false, username: 'braxtonissokewl'})

        .then((user) => {

          boardService.addUser(firstBoard.boardId, user.id)

          .then(() => {

            boardService.removeUser(firstBoard.boardId, user.id)

            .then(() =>{

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

  describe('#addAdmin()', () => {

    it('Should add an admin to a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        User.create({isFullAccount: false, username: 'braxtonissokewl'})

        .then((user) => {

          boardService.addAdmin(firstBoard.boardId, user.id)

          .then(() => {

            done();
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('#removeAdmin()', () => {

    it('Should remove a user from a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        User.create({isFullAccount: false, username: 'braxtonissokewl'})

        .then((user) => {

          boardService.addAdmin(firstBoard.boardId, user.id)

          .then(() => {

            boardService.removeAdmin(firstBoard.boardId, user.id)

            .then(() =>{

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

  describe('#addPendingUser()', () => {

    it('Should add a pending user to a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        User.create({isFullAccount: false, username: 'braxtonissokewl'})

        .then((user) => {

          boardService.addPendingUser(firstBoard.boardId, user.id)

          .then(() => {

            done();
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('#removePendingUser()', () => {

    it('Should remove a pending user from a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        User.create({isFullAccount: false, username: 'braxtonissokewl'})

        .then((user) => {

          boardService.addPendingUser(firstBoard.boardId, user.id)

          .then(() => {

            boardService.removePendingUser(firstBoard.boardId, user.id)

            .then(() =>{

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

  describe('#addIdea()', () => {

    it('Should add an idea to a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        Idea.create({content: 'purple'})

        .then((idea) => {

          boardService.addIdea(firstBoard.boardId, idea.id)

          .then(() => {

            done();
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('#removeIdea()', () => {

    it('Should remove an idea from a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        Idea.create({content: 'purple'})

        .then((idea) => {

          boardService.addIdea(firstBoard.boardId, idea.id)

          .then(() => {

            boardService.removeIdea(firstBoard.boardId, idea.id)

            .then(() =>{

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

  describe('#addIdeaCollection()', () => {

    it('Should add an idea collection to a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        IdeaCollection.create({votes: 1})

        .then((ideaCollection) => {

          boardService.addIdeaCollection(firstBoard.boardId, ideaCollection.id)

          .then(() => {

            done();
          })

          .catch(done);
        })

        .catch(done);
      })

      .catch(done);
    });
  });

  describe('#removeIdeaCollection()', () => {

    it('Should remove an idea collection from a board', (done) => {

      Board.find()

      .then((boards) => {

        const firstBoard = boards[0];

        IdeaCollection.create({votes: 1})

        .then((ideaCollection) => {

          boardService.addIdeaCollection(firstBoard.boardId, ideaCollection.id)

          .then(() => {

            boardService.removeIdeaCollection(firstBoard.boardId, ideaCollection.id)

            .then(() =>{

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

  describe('findBoard()', () => {

    it('Should return the board found with given boardId', (done) => {

      Board.create({isPublic: true})

      .then((found) => {

        boardService.findBoard(found.boardId)

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

        boardService.findBoardAndPopulate(found.boardId, 'users')

        .then(() => {

          done();
        })

        .catch(done);
      })

      .catch(done);
    });
  });
});
