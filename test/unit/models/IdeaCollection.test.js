const expect = require('chai').expect;

describe('IdeaCollectionModel', () => {

  describe('#create()', () => {

    it('Should create an IdeaCollection', (done) => {

      IdeaCollection.create({constraint:4})

      .then((ideaCollection) => {

        done();
      })

      .catch(done);
    });
  });
  describe('#find()', () => {

    it('Should check the find function', (done) => {

      IdeaCollection.find()

      .then((collections) => {

        for(var i=0; i < collections.length; i++){
          expect(collections[i].constraint).to.equal(4);
         }
        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update an IdeaCollection', (done) => {

      IdeaCollection.update({constraint:4},{constraint:3})

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
