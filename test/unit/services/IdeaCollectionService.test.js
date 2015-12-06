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

const DEF_BOARDID = '2';
const DEF_USERNAME = 'brapnis';
const DEF_COLLECTION_KEY = 'collection1';

mongoose.model('Board', require('../../../api/models/Board.js').schema);
mongoose.model('User', require('../../../api/models/User.js').schema);
mongoose.model('Idea', require('../../../api/models/Idea.js').schema);
mongoose.model('IdeaCollection', require('../../../api/models/IdeaCollection.js').schema);
mongoose.model('User', require('../../../api/models/User.js').schema);

monky.factory('Board', {boardId: DEF_BOARDID});
monky.factory('User', {username: DEF_USERNAME});
monky.factory('Idea', {boardId: DEF_BOARDID, content: 'idea number #n',
                       userId: monky.ref('User')});
monky.factory('IdeaCollection', {boardId: DEF_BOARDID,
              lastUpdatedId: monky.ref('User')});

describe('IdeaCollectionService', function() {

  before((done) => {
    database(done);
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
      expect(IdeaCollectionService.getIdeaCollections(DEF_BOARDID))
        .to.be.fulfilled
        .then((collections) => {
          expect(collections)
            .to.be.an('object')
            .and.to.have.property('collection1')
            .and.be.an('object');

          expect(collections.collection1)
            .to.have.property('key')
            .and.equal('collection1');

          expect(collections.collection1)
            .and.to.have.property('ideas')
            .and.be.an('array')
            .and.have.length(3);
        })
        .should.notify(done);
    });
  });

  describe('#findOne(boardId, key)', () => {

    beforeEach((done) => {
      // create 2 boards and 2 collections
      monky.create('Board')
        .then(() => monky.create('Idea'))
        .then((idea) => monky.create('IdeaCollection',
              { ideas: idea, key: 'collection1' }))
        .then(() => done());
    });

    afterEach((done) => clearDB(done));

    it(`should return a single collection if it exists on the given board`, () => {
      return expect(IdeaCollectionService.findByKey(DEF_BOARDID, 'collection1'))
      .to.eventually.be.an('object');
    });

    it(`should throw an error if the collection doesn't exist on the given board`, () => {
      return expect(IdeaCollectionService.findByKey(DEF_BOARDID, 'collection2'))
      .to.rejectedWith(/IdeaCollection with key \w+ not found on board \w+/);
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

    it('Should create an IdeaCollection with a single existing Idea', () => {
      return expect(IdeaCollectionService.create(USER_ID, '4', 'idea 1'))
        .to.be.fulfilled
        .then((collections) => {
          const COLLECTION_KEY = _.keys(collections[1])[0]

          expect(collections)
            .to.be.an('array')
            .and.have.length(2);

          expect(collections[0])
            .to.be.an('object');

          expect(collections[1])
            .to.be.an('object');

          expect(collections[1][COLLECTION_KEY].ideas)
            .to.have.length(1);

          expect(collections[1][COLLECTION_KEY].ideas[0])
            .to.be.an('object')
            .and.have.property('content');
        })
    });

    it('should not allow creating a collection with a non-existant idea', () => {
      return expect(IdeaCollectionService.create(USER_ID, '4', 'idea 25243324'))
      .to.be.rejected;
    });
  });

  describe('#addIdea(boardId, key, content)', () => {
    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('Idea'),
        monky.create('Idea', {content: 'idea2'}),
      ])
      .then(() => monky.create('IdeaCollection',
                               {content: 'idea1', key: DEF_COLLECTION_KEY}))
      .then(() => done());
    });

    afterEach((done) => clearDB(done));

    it('Should add an idea to an idea collection', () => {
      return expect(IdeaCollectionService.addIdea(DEF_BOARDID,
                                                  DEF_COLLECTION_KEY, 'idea2'))
      .to.eventually.have.property(DEF_COLLECTION_KEY);
    });

    it('Should reject adding a duplicate idea to an exiting idea collection', () => {
      return expect(IdeaCollectionService.addIdea(DEF_BOARDID,
                                                  DEF_COLLECTION_KEY, 'idea1'))
      .to.be.rejectedWith(/Idea collections must have unique ideas/);
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
  });

  describe('#destroy()', () => {
    const KEY = `I'm Twelve and this is deep`;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),
        monky.create('Idea', {boardId: '1', content: 'idea1'}),
        monky.create('IdeaCollection', {key: KEY}),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => clearDB(done));

    it('destroy an idea collection', () => {
      return expect(IdeaCollectionService.destroy('1', KEY))
      .to.be.eventually.become({});
    });
  });
});
