import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mochaMongoose from 'mocha-mongoose';
import Monky from 'monky';
import Promise from 'bluebird';
import _ from 'lodash';

import CFG from '../../../config';
import database from '../../../api/services/database';
import IdeaCollectionService from '../../../api/services/IdeaCollectionService';

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

const mongoose = database();
const clearDB = mochaMongoose(CFG.mongoURL, {noClear: true});
const monky = new Monky(mongoose);

mongoose.model('Board', require('../../../api/models/Board.js').schema);
mongoose.model('User', require('../../../api/models/User.js').schema);
mongoose.model('Idea', require('../../../api/models/Idea.js').schema);
mongoose.model('IdeaCollection', require('../../../api/models/IdeaCollection.js').schema);

monky.factory('Board', {boardId: '2'});
monky.factory('User', {username: 'brapnis#n'});
monky.factory('Idea', {boardId: '2', content: 'idea number #n',
                       userId: monky.ref('User')});
monky.factory('IdeaCollection', {boardId: '2', lastUpdatedId: monky.ref('User')});

describe('IdeaCollectionService', function() {

  before((done) => {
    database(done);
  });

  describe('#getAllIdeas(boardId, key)', () => {
    let createdCollectionKey;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => monky.create('IdeaCollection', { ideas: allIdeas })),
        monky.create('Idea'),
      ])
      .then((res) => {
        createdCollectionKey = res[1].key;
        done();
      });
    });

    afterEach((done) => clearDB(done));

    it('should return all the ideas in a collection', (done) => {
      expect(IdeaCollectionService.getAllIdeas('2', createdCollectionKey))
        .to.be.fulfilled
        .then((ideas) => {
          expect(ideas).to.have.length(3);
          expect(ideas).to.be.an('array');
          expect(ideas[0]).to.be.an('object');
          expect(ideas[0]).to.have.property('content')
            .and.be.a('string');
          expect(ideas[0]).to.have.keys(['content']);
        })
        .should.notify(done);
    });
  });

  describe('#getIdeaCollections(boardId)', () => {

    beforeEach((done) => {
      // create 2 boards and 2 collections
      Promise.all([
        monky.create('Board'),
        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => monky.create('IdeaCollection',
              { ideas: allIdeas, key: 'collection1' })),

        monky.create('Board', {boardId: '3'}),
        Promise.all([
          monky.create('Idea', {boardId: '3'}),
        ])
        .then((allIdeas) => monky.create('IdeaCollection',
              { boardId: '3', ideas: allIdeas, key: 'collection2' })),
      ])
      .then(() => done());
    });

    afterEach((done) => clearDB(done));

    it('should return all collections on a board', (done) => {
      expect(IdeaCollectionService.getIdeaCollections('2'))
        .to.be.fulfilled
        .then((collections) => {
          expect(collections).to.be.an('object');
          expect(collections).to.have.property('collection1')
            .and.be.an('object');
          expect(collections.collection1).to.have.property('key')
            .and.equal('collection1');
          expect(collections.collection1).to.have.property('ideas')
            .and.be.an('array')
            .and.have.length(3);
        })
        .should.notify(done);
    });
  });

  describe('#create(boardId, content)', () => {
    let USER_ID;

    beforeEach((done) => {
      Promise.all([
        monky.create('User').then((user) => {USER_ID = user.id; return user;}),
        monky.create('Board', {boardId: '4'}),
        monky.create('Idea', {boardId: '4', content: 'idea 1'}),
        monky.create('Idea', {boardId: '4', content: 'idea 2'}),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => clearDB(done));

    it('Should create an IdeaCollection with a single existing Idea', (done) => {
      return expect(IdeaCollectionService.create(USER_ID, '4', 'idea 1'))
      .to.be.fulfilled.then((collections) => {
        expect(collections).to.be.an('object');
        expect(_.keys(collections)).to.have.length(1);
      }).should.notify(done);
    });

    it('should not allow creating a collection with a non-existant idea', () => {
      return expect(IdeaCollectionService.create(USER_ID, '4', 'idea 25243324'))
      .to.be.rejected;
    });
  });

  describe('#addIdea()', () => {
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),
        monky.create('Idea', {boardId: '1', content: 'idea1'}),
        monky.create('Idea', {boardId: '1', content: 'idea2'}),
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          done();
        });
      });
    });

    afterEach((done) => clearDB(done));

    it('Should add an idea to an idea collection', () => {
      return expect(IdeaCollectionService.addIdea('1', key, 'idea2'))
        .to.eventually.have.key(key);
    });

    it('Should reject adding a duplicate idea to an exiting idea collection', () => {
      return expect(IdeaCollectionService.addIdea('1', key, 'idea1'))
        .to.be.rejectedWith(/must have unique ideas/);
    });
  });

  describe('#removeIdea()', () => {
    const collectionWith1Idea = '1';
    const collectionWith2Ideas = '2';

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),
        monky.create('Idea', {boardId: '1', content: 'idea1'}),
        monky.create('Idea', {boardId: '1', content: 'idea2'}),
        monky.create('IdeaCollection', {boardId: '1', content: 'idea1',
                     key: collectionWith1Idea}),
        monky.create('IdeaCollection', {boardId: '1', content: 'idea1',
                     key: collectionWith2Ideas}),
      ])
      .then(() => {
        IdeaCollectionService.addIdea('1', collectionWith2Ideas, 'idea2')
        .then(done());
      });
    });

    afterEach((done) => clearDB(done));

    it('Should remove an idea from an idea collection', () => {
      expect(IdeaCollectionService.removeIdea('1', collectionWith2Ideas, 'idea1'))
        .to.eventually.have.length(1);
    });

    it('Should destroy an idea collection when it is empty', () => {
      expect(IdeaCollectionService.removeIdea('1', collectionWith1Idea, 'idea1'))
        .to.eventually.not.have.key(collectionWith1Idea);
    });

    it('Should destroy an idea collection when it is empty', () => {
      expect(IdeaCollectionService.removeIdea('1', collectionWith1Idea, 'idea1'))
        .to.eventually.not.have.key(collectionWith1Idea);
    });
  });

  describe('#destroy()', () => {
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),
        monky.create('Idea', {boardId: '1', content: 'idea1'}),
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          done();
        });
      });
    });

    afterEach((done) => clearDB(done));

    it('destroy an idea collection', (done) => {
      return expect(IdeaCollectionService.destroy('1', key))
      .to.be.fulfilled;
    });
  });
});
