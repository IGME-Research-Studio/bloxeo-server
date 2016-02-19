import {expect} from 'chai';
import Promise from 'bluebird';
import _ from 'lodash';

import {monky} from '../../fixtures';
import {BOARDID, COLLECTION_KEY,
  IDEA_CONTENT, IDEA_CONTENT_2} from '../../constants';

import VotingService from '../../../api/services/VotingService';
import RedisService from '../../../api/helpers/key-val-store';
import BoardService from '../../../api/services/BoardService';
import KeyValService from '../../../api/services/KeyValService';
import StateService from '../../../api/services/StateService';
import IdeaCollectionService from '../../../api/services/IdeaCollectionService';
import ResultService from '../../../api/services/ResultService';

import {model as Board} from '../../../api/models/Board';
import {model as IdeaCollection} from '../../../api/models/IdeaCollection';
// import {model as Result} from '../../../api/models/Result';

// TODO: TAKE OUT TESTS INVOLVING ONLY REDIS COMMANDS
// TODO: USE STUBS ON MORE COMPLICATED FUNCTIONS WITH REDIS COMMANDS
//
const resetRedis = (userId) => {
  return Promise.all([
    RedisService.del(`${BOARDID}-current-users`),
    RedisService.del(`${BOARDID}-ready`),
    RedisService.del(`${BOARDID}-voting-${userId}`),
    RedisService.del(`${BOARDID}-state`),
  ]);
};

describe('VotingService', function() {
  describe('#startVoting(boardId)', () => {
    let boardFindOneAndUpdateStub;
    let removeDuplicateCollectionsStub;
    let clearVotingReadyStub;
    let voteOnIdeaCollectionsStub;

    before(function() {
      boardFindOneAndUpdateStub = this.stub(Board, 'findOneAndUpdate')
      .returns(Promise.resolve('Returned a board'));
      removeDuplicateCollectionsStub = this.stub(IdeaCollectionService, 'removeDuplicates')
      .returns(Promise.resolve('Returns all of the unique collections'));
      clearVotingReadyStub = this.stub(KeyValService, 'clearVotingReady')
      .returns(Promise.resolve('Cleared voting ready key'));
      voteOnIdeaCollectionsStub = this.stub(StateService, 'voteOnIdeaCollections')
      .returns(Promise.resolve('Set state to vote on collections'));
    });

    beforeEach((done) => {
      Promise.all([
        monky.create('Board')
        .then(() => {
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

    it('Should set up voting stage', () => {
      return expect(VotingService.startVoting(BOARDID, false, '')).to.be.fulfilled
      .then(() => {
        expect(boardFindOneAndUpdateStub).to.have.been.called;
        expect(removeDuplicateCollectionsStub).to.have.been.called;
        expect(clearVotingReadyStub).to.have.been.called;
        expect(voteOnIdeaCollectionsStub).to.have.been.called;
      });
    });
  });

  describe('#finishVoting(boardId)', () => {
    let boardFindOneStub;
    let ideaCollectionFindStub;
    // let ideaCollectionSelectStub;
    let ideaCollectionDestroyStub;
    let resultCreateStub;
    let clearVotingDoneStub;
    let stateCreateIdeaCollectionsStub;

    const boardObj = { round: 0 };
    const collections = [
      {collection1: {ideas: ['idea1', 'idea2'], votes: 0, lastUpdatedId: 'user1'}},
    ];
    // const mockSelect = {
    //   select: function() { return this; },
    // };


    before(function() {
      boardFindOneStub = this.stub(Board, 'findOne')
      .returns(Promise.resolve(boardObj));
      ideaCollectionFindStub = this.stub(IdeaCollection, 'find')
      .returns(Promise.resolve(collections));
      // ideaCollectionSelectStub = this.stub(mockSelect, 'select')
      // .returns(Promise.resolve(collections));
      resultCreateStub = this.stub(ResultService, 'create')
      .returns(Promise.resolve('Called result service create'));
      ideaCollectionDestroyStub = this.stub(IdeaCollectionService, 'destroy')
      .returns(Promise.resolve('Called idea collection service destroy'));
      clearVotingDoneStub = this.stub(KeyValService, 'clearVotingDone')
      .returns(Promise.resolve('Called KeyValService clearVotingDone'));
      stateCreateIdeaCollectionsStub = this.stub(StateService, 'createIdeaCollections')
      .returns(Promise.resolve('Called state service createIdeaCollections'));
    });

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

    it('Should remove current idea collections and create results', () => {
      return expect(VotingService.finishVoting(BOARDID, false, '')).to.be.fulfilled
      .then(() => {
        expect(boardFindOneStub).to.have.returned;
        expect(ideaCollectionFindStub).to.have.returned;
        expect(resultCreateStub).to.have.been.called;
        expect(ideaCollectionDestroyStub).to.have.been.called;
        expect(clearVotingDoneStub).to.have.been.called;
        expect(stateCreateIdeaCollectionsStub).to.have.been.called;
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
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    xit('Should show that the room is not ready to vote/finish voting', (done) => {
      VotingService.isRoomReady(BOARDID)
      .then((isRoomReady) => {
        expect(isRoomReady).to.be.false;
        done();
      });
    });

    xit('Should check if all connected users are ready to vote/finish voting', (done) => {
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
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    xit('Should add the collections to vote on into Redis and return them', (done) => {
      VotingService.getVoteList(BOARDID, USERID)
      .then((collections) => {
        expect(_.keys(collections)).to.have.length(1);
        done();
      });
    });

    xit('Should return the remaining collections to vote on', (done) => {
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
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    xit('Should vote on a collection and not increment the vote', () => {
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

    xit('Should vote on a collection and increment the vote', (done) => {
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
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    xit('Should get all of the results on a board ', (done) => {
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
