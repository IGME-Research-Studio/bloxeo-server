const expect = require('chai').expect;
const should = require('chai').should();

describe('IdeaModel', () => {

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

    it('Should not create an Idea w/o content', (done) => {

      Idea.create()

      .exec(function(err, idea) {

        should.exist(err);
        should.not.exist(idea);
        done();
      });
    });

    it('Should not create an Idea with only whitespace content', (done) => {

      Idea.create({content: '      '})

      .exec(function(err, idea) {

        should.exist(err);
        should.not.exist(idea);
        done();
      });
    });
  });

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      Idea.find()

      .then((ideas) => {

        for (let i = 0; i < ideas.length; i++) {
          expect(ideas[i].content).to.be.a('string');
        }
        done();
      })

      .catch(done);
    });
  });

  describe('#findOne()', () => {

    it('Should check the findOne function', (done) => {

      Idea.findOne({content: 'Purple'})

      .then((idea) => {

        expect(idea.content).to.equal('Purple');
        done();
      })

      .catch(done);
    });
  });

  describe('#update()', () => {

    xit('Should update an Idea', (done) => {

      Idea.update({content: 'Purple'}, {content: 'Green'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    xit('Should destroy an Idea', (done) => {

      Idea.destroy({content: 'Green'})

      .then(() => {

        done();
      })

      .catch(done);
    });
  });
});
