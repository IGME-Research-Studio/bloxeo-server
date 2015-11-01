const expect = require('chai').expect;

describe('IdeaCollectionModel', () => {

  describe('#create()', () => {

    it('Should create an IdeaCollection', (done) => {

      IdeaCollection.create({votes: 4})

      .then((ideaCollection) => {
        expect(ideaCollection).to.be.an('object');

        done();
      })

      .catch(done);
    });
  });

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      IdeaCollection.find()

      .then((collections) => {
        expect(collections.length).to.be.above(0);

        _.each(collections, (collection) => {
          expect(collection.votes).to.be.a('number');
        });

        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    xit('Should update an IdeaCollection', (done) => {

      IdeaCollection.update({votes: 4}, {votes: 5})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    xit('Should destroy an IdeaCollection', (done) => {

      IdeaCollection.destroy()

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
