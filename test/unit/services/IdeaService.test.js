import {expect} from 'chai';
import Promise from 'bluebird';

import {monky} from '../../fixtures';
import {BOARDID, BOARDID_2,
  IDEA_CONTENT, IDEA_CONTENT_2} from '../../constants';

import * as IdeaService from '../../../api/services/IdeaService';
import * as IdeaCollectionService from '../../../api/services/IdeaCollectionService';

describe('IdeaService', function() {

  describe('#index(boardId)', () => {
    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('Idea'),
        monky.create('Idea'),
        monky.create('Idea'),
        monky.create('Idea', {boardId: BOARDID_2}),
      ])
      .then(() => done());
    });

    it('should return the only the ideas on the specified board', (done) => {
      IdeaService.getIdeas(BOARDID)
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
      IdeaService.getIdeas(BOARDID)
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
        monky.create('Board', {boardId: BOARDID_2}),
        monky.create('Idea', {content: IDEA_CONTENT}),
      ])
      .then(() => {
        done();
      });
    });

    it('should not create duplicates on a board and throw correct validation error', (done) => {
      expect(IdeaService.create(USER_ID, BOARDID, IDEA_CONTENT))
        .to.be.rejectedWith(/content must be unique/).notify(done);
    });

    it('should allow duplicates on different boards', (done) => {
      expect(IdeaService.create(USER_ID, BOARDID_2, IDEA_CONTENT))
        .to.not.be.rejected.notify(done);
    });

    it('should return all the ideas in the correct format to send back to client', (done) => {
      IdeaService.create(USER_ID, BOARDID, 'a new idea on the board')
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

  describe('#destroy(board, userId, ideaContent)', () => {
    let boardObj;
    let userId;

    beforeEach((done) => {
      monky.create('User')
      .then((user) => {
        userId = user.id;
        return user.id;
      })
      .then(() => {
        return monky.create('Board', {admins: [userId]});
      })
      .then((board) => {
        boardObj = board;

        return Promise.all([
          monky.create('Idea', {boardId: BOARDID, content: IDEA_CONTENT}),
          monky.create('Idea', {boardId: BOARDID, content: IDEA_CONTENT_2}),
        ])
        .then((ideas) => {
          monky.create('IdeaCollection', {boardId: BOARDID, ideas: ideas});
          done();
        });
      });
    });

    it('should destroy the correct idea from the board', (done) => {
      return IdeaService.destroy(boardObj, userId, IDEA_CONTENT)
        .then(() => {
          return Promise.all([
            IdeaService.getIdeas(BOARDID),
            IdeaCollectionService.getIdeaCollections(BOARDID),
          ]);
        })
        .then(([ideas, collections]) => {
          expect(ideas).to.have.deep.property('[0].content', IDEA_CONTENT_2);
          expect(collections.collection2).to.have.property('ideas')
            .to.not.have.members([IDEA_CONTENT]);
          done();
        });
    });

    it('should return all the ideas in the correct format to send back to client', () => {
      return expect(IdeaService.destroy(boardObj, userId, IDEA_CONTENT))
        .to.eventually.be.an('array')
          .and.to.have.deep.property('[0]')
          .and.to.not.respondTo('userId')
          .and.to.not.respondTo('boardId')
          .and.to.respondTo('content');
    });
  });
});
