const expect = require('chai').expect;

describe('IdeaCollectionModel', () => {

  describe('#create()', () => {

    it('Should create an IdeaCollection', (done) => {

      IdeaCollection.create({votes: 4})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
  describe('#find()', () => {

    it('Should check the find function', (done) => {

      IdeaCollection.find()

      .then((collections) => {

        for (let i = 0; i < collections.length; i++) {
          expect(collections[i].votes).to.be.a('number');
        }
        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update an IdeaCollection', (done) => {

      IdeaCollection.update({votes: 4}, {votes: 5})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy an IdeaCollection', (done) => {

      IdeaCollection.destroy()

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
