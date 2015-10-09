const expect = require('chai').expect;

describe('IdeaModel', () => {

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      Idea.find()

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#create()', () => {

    it('Should create an Idea', (done) => {

      Idea.create({

        content: 'Purple',
      })

      .then((idea) => {

        expect(idea.content).to.be.a('string');

        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update an Idea', (done) => {

      Idea.update({content: 'Purple'}, {content: 'Green'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy an Idea', (done) => {

      Idea.destroy({content: 'Green'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
