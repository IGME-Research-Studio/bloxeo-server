import {expect} from 'chai';
import Promise from 'bluebird';
import _ from 'lodash';

import {monky} from '../../fixtures';
import {BOARDID, COLLECTION_KEY,
  IDEA_CONTENT, IDEA_CONTENT_2} from '../../constants';

import VotingService from '../../../api/services/VotingService';
import RedisService from '../../../api/helpers/key-val-store';
import BoardService from '../../../api/services/BoardService';

import {model as Board} from '../../../api/models/Board';
import {model as IdeaCollection} from '../../../api/models/IdeaCollection';
import {model as Result} from '../../../api/models/Result';

// TODO: TAKE OUT TESTS INVOLVING ONLY REDIS COMMANDS
// TODO: USE STUBS ON MORE COMPLICATED FUNCTIONS WITH REDIS COMMANDS

describe('VotingService', function() {

  describe('#startVoting(boardId)', () => {
    let round;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board')
        .then((result) => {
          round = result.round;
        }),

        Promise.all([
          monky.create('Idea', {boardId: BOARDID, content: IDEA_CONTENT}),
          monky.create('Idea', {boardId: BOARDID, content: IDEA_CONTENT_2}),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {ideas: allIdeas}),
            monky.create('IdeaCollection', {ideas: allIdeas}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    it('Should increment round', (done) => {
      VotingService.startVoting(BOARDID)
      .then(() => {
        return Board.findOne({boardId: BOARDID})
        .then((board) => {
          expect(board.round).to.equal(round + 1);
          done();
        });
      });
    });
  });

  describe('#finishVoting(boardId)', () => {
    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),

        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {ideas: allIdeas}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    it('Should remove current idea collections and create results', (done) => {
      VotingService.finishVoting(BOARDID)
      .then(() => {
        Promise.all([
          IdeaCollection.find({boardId: BOARDID}),
          Result.find({boardId: BOARDID}),
        ])
        .spread((collections, results) => {
          expect(collections).to.have.length(0);
          expect(results).to.have.length(1);
          done();
        });
      });
    });
  });

  describe('#isRoomReady(boardId)', () => {
    let USERID;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('User').then((user) => {USERID = user.id; return user;}),

        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join(BOARDID, USERID),
            monky.create('IdeaCollection', {ideas: allIdeas}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del(`${BOARDID}-current-users`),
        RedisService.del(`${BOARDID}-ready`),
        RedisService.del(`${BOARDID}-voting-${USERID}`),
      ])
      .then(() => {
        done();
      });
    });

    it('Should show that the room is not ready to vote/finish voting', (done) => {
      VotingService.isRoomReady(BOARDID)
      .then((isRoomReady) => {
        expect(isRoomReady).to.be.false;
        done();
      });
    });

    it('Should check if all connected users are ready to vote/finish voting', (done) => {
      VotingService.setUserReady(BOARDID, USERID)
      .then((isRoomReady) => {
        expect(isRoomReady).to.be.true;
        done();
      });
    });
  });

  describe('#getVoteList(boardId, userId)', () => {
    let USERID;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('User').then((user) => {USERID = user.id; return user;}),

        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join('1', USERID),
            monky.create('IdeaCollection', {ideas: allIdeas,
                         key: COLLECTION_KEY}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del(`${BOARDID}-current-users`),
        RedisService.del(`${BOARDID}-ready`),
        RedisService.del(`${BOARDID}-voting-${USERID}`),
      ])
      .then(() => {
        done();
      });
    });

    it('Should add the collections to vote on into Redis and return them', (done) => {
      VotingService.getVoteList(BOARDID, USERID)
      .then((collections) => {
        expect(_.keys(collections)).to.have.length(1);
        done();
      });
    });

    it('Should return the remaining collections to vote on', (done) => {
      // Set up the voting list in Redis
      VotingService.getVoteList(BOARDID, USERID)
      .then(() => {
        VotingService.vote(BOARDID, USERID, COLLECTION_KEY, false)
        .then(() => {
          VotingService.getVoteList(BOARDID, USERID)
          .then((collections) => {
            expect(_.keys(collections)).to.have.length(0);
            done();
          });
        });
      });
    });
  });

  describe('#vote(boardId, userId, key, increment)', () => {
    let USERID;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board'),
        monky.create('User').then((user) => {USERID = user.id; return user;}),
        Promise.all([
          monky.create('Idea'),
          monky.create('Idea'),
        ])
        .then((allIdeas) => {
          return Promise.all([
            BoardService.join('1', USERID),
            monky.create('IdeaCollection', {ideas: allIdeas,
                         key: COLLECTION_KEY}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del(`${BOARDID}-current-users`),
        RedisService.del(`${BOARDID}-ready`),
        RedisService.del(`${BOARDID}-voting-${USERID}`),
      ])
      .then(() => {
        done();
      });
    });

    it('Should vote on a collection and not increment the vote', () => {
      return VotingService.getVoteList(BOARDID, USERID)
      .then(() => {
        return VotingService.vote(BOARDID, USERID, COLLECTION_KEY, false)
        .then((success) => {

          // Momentarily we send back true as a response to a successful vote
          // If there are no collections left to vote on it sets the user ready
          // Either way this is true so how do we differentiate? By Events?
          expect(success).to.be.true;

          // Have to query for the idea collection we voted on again since votes are stripped
          return IdeaCollection.findOne({boardId: BOARDID, key: COLLECTION_KEY})
          .then((collection) => {
            expect(collection.votes).to.equal(0);
          });
        });
      });
    });

    it('Should vote on a collection and increment the vote', (done) => {
      VotingService.getVoteList(BOARDID, USERID)
      .then(() => {
        VotingService.vote(BOARDID, USERID, COLLECTION_KEY, true)
        .then((success) => {
          expect(success).to.be.true;
          IdeaCollection.findOne({boardId: BOARDID, key: COLLECTION_KEY})
          .then((collection) => {
            expect(collection.votes).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('#getResults(boardId)', () => {
    let USERID;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),
        monky.create('User').then((user) => {USERID = user.id; return user;}),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join(BOARDID, USERID),
            monky.create('IdeaCollection', {ideas: allIdeas,
                         key: COLLECTION_KEY}),
            monky.create('IdeaCollection', {ideas: [allIdeas[0]]}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del(`${BOARDID}-current-users`),
        RedisService.del(`${BOARDID}-ready`),
        RedisService.del(`${BOARDID}-voting-${USERID}`),
      ])
      .then(() => {
        done();
      });
    });

    it('Should get all of the results on a board ', (done) => {
      VotingService.finishVoting(BOARDID)
      .then(() => {
        VotingService.getResults(BOARDID)
        .then((results) => {
          expect(_.keys(results)).to.have.length(1);
          expect(_.keys(results[0])).to.have.length(2);
          done();
        });
      });
    });
  });
});
