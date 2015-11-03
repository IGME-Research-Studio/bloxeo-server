const expect = require('chai').expect;

describe('IdeaController', () => {
  let boardId;
  const numIdeas = 0;

  before((done) => {
    Board.create({isPublic: true})
      .then((res) => {
        boardId = res.boardId;
        done();
      });
  });

  describe('POST /boards/:boardId/ideas', () => {

    xit('should create an idea and add it to the board', (done) => {
      sails.req('post', `/boards/${boardId}/ideas`)
        .expect(201)
        .send({content: 'Peter'})
        .end((err, res) => {
          if (err) throw err;

          expect(res.body.data.ideas.length).to.equal(numIdeas + 1);
          done();
        });
    });

    xit('should not allow duplicates', (done) => {
      sails.req('post', `/boards/${boardId}/ideas`)
        .expect(500)
        .send({content: 'Peter'})
        .end(() => {
          done();
        });
    });
  });

  describe('GET /board/:boardId/idea', () => {

    xit('should return all the ideas associated with a board', (done) => {
      sails.req('get', `/boards/${boardId}/ideas`)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;

          expect(res.body.data.length).to.equal(numIdeas + 1);
          done();
        });
    });
  });

  describe('DELETE /board/:boardId/idea', () => {

    xit('should delete the idea based on board and idea content', (done) => {
      sails.req('delete', `/boards/${boardId}/ideas`)
        .expect(200)
        .send({content: 'Peter'})
        .end((err, res) => {
          if (err) throw err;

          expect(res.body.data.ideas.length).to.equal(numIdeas);
          done();
        });
    });
  });
});
