import {expect} from 'chai';
import Promise from 'bluebird';
import _ from 'lodash';
import sinon from 'sinon';

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

    before(function() {
      boardFindOneStub = this.stub(Board, 'findOne')
      .returns(Promise.resolve(boardObj));
      ideaCollectionFindStub = this.stub(IdeaCollection, 'find')
      .returns(Promise.resolve(collections));
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

  describe('#isRoomReady(votingAction, boardId)', () => {
    let USERID;
    let requiredState;
    let getUsersInRoomStub;
    let isUserReadyToVoteStub;
    let isUserDoneVotingStub;
    let getStateStub;
    let startVotingStub;
    let finishVotingStub;

    const users = ['user1', 'user2'];

    before(function() {
      getUsersInRoomStub = this.stub(KeyValService, 'getUsersInRoom')
      .returns(Promise.resolve(users));
      startVotingStub = this.stub(VotingService, 'startVoting')
      .returns(Promise.resolve('start voting called'));
      finishVotingStub = this.stub(VotingService, 'finishVoting')
      .returns(Promise.resolve('finish voting called'));
    });

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
        getStateStub.restore();
        done();
      });
    });

    it('Should result in the room not being ready to vote', () => {
      requiredState = StateService.StateEnum.createIdeaCollections;

      isUserReadyToVoteStub = sinon.stub(VotingService, 'isUserReadyToVote')
      .returns(Promise.resolve(false));

      getStateStub = sinon.stub(StateService, 'getState')
      .returns(Promise.resolve(requiredState));

      return expect(VotingService.isRoomReady('start', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserReadyToVoteStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(startVotingStub).to.not.have.been.called;
        expect(readyToVote).to.be.false;

        isUserReadyToVoteStub.restore();
      });
    });

    it('Should result in the room being ready to vote', () => {
      requiredState = StateService.StateEnum.createIdeaCollections;

      isUserReadyToVoteStub = sinon.stub(VotingService, 'isUserReadyToVote')
      .returns(Promise.resolve(true));

      getStateStub = sinon.stub(StateService, 'getState')
      .returns(Promise.resolve(requiredState));

      return expect(VotingService.isRoomReady('start', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserReadyToVoteStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(startVotingStub).to.have.been.called;
        expect(readyToVote).to.be.true;

        isUserReadyToVoteStub.restore();
      });
    });

    it('Should result in the room not being ready to finish voting', () => {
      requiredState = StateService.StateEnum.voteOnIdeaCollections;

      isUserDoneVotingStub = sinon.stub(VotingService, 'isUserDoneVoting')
      .returns(Promise.resolve(false));

      getStateStub = sinon.stub(StateService, 'getState')
      .returns(Promise.resolve(requiredState));

      return expect(VotingService.isRoomReady('finish', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserDoneVotingStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(finishVotingStub).to.have.not.been.called;
        expect(readyToVote).to.be.false;

        isUserDoneVotingStub.restore();
      });
    });

    it('Should result in the room being ready to finish voting', () => {
      requiredState = StateService.StateEnum.voteOnIdeaCollections;

      isUserDoneVotingStub = sinon.stub(VotingService, 'isUserDoneVoting')
      .returns(Promise.resolve(true));

      getStateStub = sinon.stub(StateService, 'getState')
      .returns(Promise.resolve(requiredState));

      return expect(VotingService.isRoomReady('finish', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserDoneVotingStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(finishVotingStub).to.have.been.called;
        expect(readyToVote).to.be.true;

        isUserDoneVotingStub.restore();
      });
    });
  });

  // describe('#isUserReady(votingAction, boardId, userId)', () => {
  //   let getUsersReadyToVoteStub;
  //   let getUsersDoneVotingStub;
  //
  //   beforeEach((done) => {
  //     Promise.all([
  //       monky.create('Board'),
  //       monky.create('User').then((user) => {USERID = user.id; return user;}),
  //
  //       Promise.all([
  //         monky.create('Idea'),
  //         monky.create('Idea'),
  //       ])
  //       .then((allIdeas) => {
  //         Promise.all([
  //           monky.create('IdeaCollection', {ideas: allIdeas}),
  //         ]);
  //       }),
  //     ])
  //     .then(() => {
  //       done();
  //     });
  //   });
  //
  //   afterEach((done) => {
  //     resetRedis(USERID)
  //     .then(() => {
  //       done();
  //     });
  //   });
  //
  //   it('Should not have the user be ready to vote')
  // });

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
