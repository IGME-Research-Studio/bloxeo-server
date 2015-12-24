import {expect} from 'chai';
import Promise from 'bluebird';
import _ from 'lodash';

import {monky} from '../../fixtures';
import {BOARDID, BOARDID_2, COLLECTION_KEY} from '../../constants';

import IdeaCollectionService from '../../../api/services/IdeaCollectionService';

describe('IdeaCollectionService', function() {

  describe('#getIdeaCollections(boardId)', () => {

    beforeEach((done) => {
      // create 2 boards and 2 collections
      Promise.all([
        // Board 1
        monky.create('Board'),
        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => monky.create('IdeaCollection',
              { ideas: allIdeas, key: 'collection1' })),
        // Board 2
        monky.create('Board', {boardId: BOARDID_2}),
        monky.create('Idea', {boardId: BOARDID_2})
          .then((allIdeas) => monky.create('IdeaCollection',
            {boardId: BOARDID, ideas: allIdeas, key: 'collection2' })),
      ])
      .then(() => {
        done();
      });
    });

    it('should return all collections on a board', () => {
      return expect(IdeaCollectionService.getIdeaCollections(BOARDID))
        .to.be.fulfilled
        .then((collections) => {
          expect(collections)
            .to.have.property('collection1')
            .and.be.an('object');

          expect(collections.collection1)
            .to.have.property('key')
            .and.equal('collection1');

          expect(collections.collection1)
            .and.to.have.property('ideas')
            .and.be.an('array')
            .and.have.length(3);
        });
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

    it(`should return a single collection if it exists on the given board`, () => {
      return expect(IdeaCollectionService.findByKey(BOARDID, 'collection1'))
      .to.eventually.be.an('object');
    });

    it(`should throw an error if the collection doesn't exist on the given board`, () => {
      return expect(IdeaCollectionService.findByKey(BOARDID, 'collection2'))
      .to.rejectedWith(/IdeaCollection with key \w+ not found on board \w+/);
    });
  });

  describe('#create(boardId, content)', () => {
    let USER_ID;

    beforeEach((done) => {
      Promise.all([
        monky.create('User').then((user) => {USER_ID = user.id; return user;}),
        monky.create('Board'),
        monky.create('Idea', {content: 'idea 1'}),
        monky.create('Idea', {content: 'idea 2'}),
      ])
      .then(() => {
        done();
      });
    });

    it('Should create an IdeaCollection with a single existing Idea', () => {
      return expect(IdeaCollectionService.create(USER_ID, BOARDID, 'idea 1'))
        .to.be.fulfilled
        .then((collections) => {
          const THIS_COLLECTION_KEY = _.keys(collections[1])[0];

          expect(collections)
            .to.be.an('array')
            .and.have.length(2);

          expect(collections[0])
            .to.be.an('object');

          expect(collections[1])
            .to.be.an('object');

          expect(collections[1][THIS_COLLECTION_KEY].ideas)
            .to.have.length(1);

          expect(collections[1][THIS_COLLECTION_KEY].ideas[0])
            .to.be.an('object')
            .and.have.property('content');
        });
    });

    it('should not allow creating a collection with a non-existant idea', () => {
      return expect(IdeaCollectionService.create(USER_ID, '4', 'idea 25243324'))
      .to.be.rejected;
    });
  });

  describe('#addIdea(userId, boardId, key, content)', () => {
    let USER_ID;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('User')
          .then((user) => {USER_ID = user.id; return user;}),
        monky.create('Idea', {boardid: BOARDID, content: 'idea2'}),
        monky.create('IdeaCollection', {key: COLLECTION_KEY}),
      ])
      .then(() => {
        done();
      });
    });

    it('Should add an idea to an idea collection', () => {
      return expect(IdeaCollectionService.addIdea(USER_ID, BOARDID,
                                                  COLLECTION_KEY, 'idea2'))
      .to.eventually.have.property(COLLECTION_KEY);
    });

    xit('Should reject adding a duplicate idea to an exiting idea collection', () => {
      return expect(IdeaCollectionService.addIdea(USER_ID, BOARDID,
                                                  COLLECTION_KEY, 'idea1'))
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
    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),
        monky.create('Idea', {boardId: '1', content: 'idea1'}),
        monky.create('IdeaCollection', {boardId: '1', key: COLLECTION_KEY}),
      ])
      .then(() => {
        done();
      });
    });

    it('destroy an idea collection', () => {
      return IdeaCollectionService.findByKey('1', COLLECTION_KEY)
        .then((collection) => {
          return expect(IdeaCollectionService.destroy('1', collection))
          .to.be.eventually.become({});
        });
    });

    it('destroy an idea collection by key', (done) => {
      IdeaCollectionService.destroyByKey('1', COLLECTION_KEY).then(done());
    });
  });

  describe('#removeDuplicates()', () => {
    const collection1 = '1';
    const duplicate = '2';
    const diffCollection = '3';

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '7'}),
        Promise.all([
          monky.create('Idea', {boardId: '7', content: 'idea1'}),
          monky.create('Idea', {boardId: '7', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection',
              { boardId: '7', ideas: allIdeas[0], key: collection1 });
          monky.create('IdeaCollection',
              { boardId: '7', ideas: allIdeas[0], key: duplicate });
          monky.create('IdeaCollection',
              { boardId: '7', ideas: allIdeas[1], key: diffCollection });
        }),
      ])
      .then(() => {
        done();
      });
    });

    it('Should only remove duplicate ideaCollections', () => {
      return IdeaCollectionService.removeDuplicates('7')
      .then(() => IdeaCollectionService.getIdeaCollections('7'))
      .then((collections) => {
        expect(Object.keys(collections)).to.have.length(2);
        expect(collections).to.contains.key(duplicate);
        expect(collections).to.contains.key(diffCollection);
      });
    });
  });
});
