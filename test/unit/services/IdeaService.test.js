import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mochaMongoose from 'mocha-mongoose';
import Monky from 'monky';
import Promise from 'bluebird';

import CFG from '../../../config';
import database from '../../../api/services/database';
import IdeaService from '../../../api/services/IdeaService.js';

chai.use(chaiAsPromised);
const expect = chai.expect;

const mongoose = database();
const clearDB = mochaMongoose(CFG.mongoURL, {noClear: true});
const monky = new Monky(mongoose);

mongoose.model('Board', require('../../../api/models/Board.js').schema);
mongoose.model('Idea', require('../../../api/models/Idea.js').schema);
mongoose.model('User', require('../../../api/models/User.js').schema);

monky.factory('Board', {boardId: '1'});
monky.factory('User', {username: 'brapnis#n'});
monky.factory('Idea', {boardId: '1', content: 'idea number #n',
                       userId: monky.ref('User')});

describe('IdeaService', function() {

  before((done) => {
    database(done);
  });

  describe('#index(boardId)', () => {
    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('Idea'),
        monky.create('Idea'),
        monky.create('Idea'),
        monky.create('Idea', {boardId: '2'}),
      ])
      .then(() => done());
    });

    afterEach((done) => clearDB(done));

    it('should return the only the ideas on the specified board', (done) => {
      IdeaService.getIdeas('1')
        .then((ideas) => {
          try {
            expect(ideas.length).to.equal(3);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });

    it('should return an array of objects with just the content string', (done) => {
      IdeaService.getIdeas('1')
        .then((ideas) => {
          try {
            expect(ideas).to.be.an('array');
            expect(ideas[0]).to.be.an('object');
            expect(ideas[0]).to.have.property('content').and.be.a('string');
            expect(ideas[0]).to.not.contain.keys(['userId', '_id', 'boardId']);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });
  });

  describe('#create(userId, boardId, ideaContent)', () => {
    let USER_ID;

    beforeEach((done) => {
      Promise.all([
        monky.create('User').then((user) => {USER_ID = user._id; return user;}),
        monky.create('Board'),
        monky.create('Board', {boardId: 2}),
        monky.create('Idea', {content: '1'}),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => clearDB(done));

    it('should not create duplicates on a board and throw correct validation error', (done) => {
      expect(IdeaService.create(USER_ID, '1', '1'))
        .to.be.rejectedWith(/content must be unique/).notify(done);
    });

    it('should allow duplicates on different boards', (done) => {
      expect(IdeaService.create(USER_ID, '2', '1'))
        .to.not.be.rejected.notify(done);
    });

    it('should return all the ideas in the correct format to send back to client', (done) => {
      IdeaService.create(USER_ID, '1', 'blah')
        .then((ideas) => {
          try {
            expect(ideas).to.be.an('array');
            expect(ideas[0]).to.be.an('object');
            expect(ideas[0]).to.have.property('content').and.be.a('string');
            expect(ideas[0]).to.not.contain.keys(['userId', '_id', 'boardId']);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });
  });

  describe('#destroy(boardId, ideaContent)', () => {
    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('Idea', {content: '1'}),
        monky.create('Idea', {content: '2'}),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => clearDB(done));

    it('should destroy the correct idea from the board', (done) => {
      IdeaService.destroy('1', '2')
      .then(() => {
        IdeaService.getIdeas('1')
        .then((ideas) => {
          try {
            expect(ideas[0].content).to.equal('1');
            done();
          }
          catch (e) {
            done(e);
          }
        });
      });
    });

    it('should return all the ideas in the correct format to send back to client', (done) => {
      IdeaService.destroy('1', '2')
        .then((ideas) => {
          try {
            expect(ideas).to.be.an('array');
            expect(ideas[0]).to.be.an('object');
            expect(ideas[0]).to.have.property('content').and.be.a('string');
            expect(ideas[0]).to.not.contain.keys(['userId', '_id', 'boardId']);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });
  });
});
