import { expect } from 'chai';
import mongoose from 'mongoose';
import mochaMongoose from 'mocha-mongoose';
import Monky from 'monky';
import Promise from 'bluebird';

import CFG from '../../../config';
import IdeaService from '../../../api/services/IdeaService.js';

const testMongoURL = CFG.mongoURL;
const clearDB = mochaMongoose(testMongoURL, {noClear: true});
const monky = new Monky(mongoose);

mongoose.model('Board', require('../../../api/models/Board.js').schema);
mongoose.model('Idea', require('../../../api/models/Idea.js').schema);
monky.factory('Board', {boardId: '1'});
monky.factory('Idea', {boardId: '1', content: 'idea number #n'});

describe('IdeaService', function() {
  this.timeout(10000);

  before((done) => {
    if (mongoose.connection.db) return done();

    mongoose.connect(testMongoURL, done);
  });

  describe('#index', () => {
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
            expect(ideas[0]).to.not.contain.keys(['user', '_id', 'boardId']);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });
  });

  describe('#create', () => {

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => clearDB(done));

    it('should return all the ideas in the correct format to send back to client', (done) => {
      IdeaService.create(null, '1', 'blah')
        .then((ideas) => {
          try {
            expect(ideas).to.be.an('array');
            expect(ideas[0]).to.be.an('object');
            expect(ideas[0]).to.have.property('content').and.be.a('string');
            expect(ideas[0]).to.not.contain.keys(['user', '_id', 'boardId']);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });
  });

  describe('#destroy', () => {
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
            expect(ideas[0]).to.not.contain.keys(['user', '_id', 'boardId']);
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });
  });
});
