import { expect } from 'chai';
import Promise from 'bluebird';
import _ from 'lodash';
import { monky } from '../../fixtures';
import { BOARDID } from '../../constants';

import Redis from '../../../api/helpers/key-val-store';
import {
  startVoting,
  finishVoting,
  vote,
  getResults,
  getVoteList,
  isUserDoneVoting,
  isUserReadyToVote,
  setUserReadyToFinishVoting,
  setUserReadyToVote,
  isRoomReady,
  isUserReady,
  wasCollectionVotedOn,
} from '../../../api/services/VotingService';

import {
  getCollectionsToVoteOn,
  removeFromUserVotingList,
  readyUserToVote,
  checkUserVotingListExists,
  addToUserVotingList,
  readyUserDoneVoting,
  getUsersDoneVoting,
  getUsersReadyToVote,
  getUsersInRoom,
  clearVotingDone,
  clearVotingReady,
} from '../../../api/services/KeyValService';

import {
  getState,
  StateEnum,
  createIdeaCollections,
  voteOnIdeaCollections,
} from '../../../api/services/StateService';

import {
  getIdeaCollections,
  removeDuplicates,
} from '../../../api/services/IdeaCollectionService';

import { createResult } from '../../../api/services/ResultService';

import { model as Board } from '../../../api/models/Board';
import { model as IdeaCollection } from '../../../api/models/IdeaCollection';
import { UnauthorizedError } from '../../../api/helpers/extendable-error';

const resetRedis = (userId) => {
  return Promise.all([
    Redis.del(`${BOARDID}-current-users`),
    Redis.del(`${BOARDID}-ready`),
    Redis.del(`${BOARDID}-voting-${userId}`),
    Redis.del(`${BOARDID}-state`),
  ]);
};

describe('VotingService', function() {
  xdescribe('#startVoting(boardId)', () => {
    let boardFindOneAndUpdateStub;
    let removeDuplicateCollectionsStub;
    let clearVotingReadyStub;
    let voteOnIdeaCollectionsStub;

    before(function() {
      boardFindOneAndUpdateStub = this.stub(Board, 'findOneAndUpdate')
      .returns(Promise.resolve('Returned a board'));
      removeDuplicateCollectionsStub = this.stub(removeDuplicates)
      .returns(Promise.resolve('Returns all of the unique collections'));
      clearVotingReadyStub = this.stub(clearVotingReady)
      .returns(Promise.resolve('Cleared voting ready key'));
      voteOnIdeaCollectionsStub = this.stub(voteOnIdeaCollections)
      .returns(Promise.resolve('Set state to vote on collections'));
    });

    it('Should set up voting stage', () => {
      return expect(startVoting(BOARDID, false, '')).to.be.fulfilled
      .then(() => {
        expect(boardFindOneAndUpdateStub).to.have.been.called;
        expect(removeDuplicateCollectionsStub).to.have.been.called;
        expect(clearVotingReadyStub).to.have.been.called;
        expect(voteOnIdeaCollectionsStub).to.have.been.called;
      });
    });
  });

  xdescribe('#finishVoting(boardId)', () => {
    let boardFindOneStub;
    let ideaCollectionFindStub;
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
      resultCreateStub = this.stub(createResult)
      .returns(Promise.resolve('Called result service create'));
      ideaCollectionDestroyStub = this.stub(destroy)
      .returns(Promise.resolve('Called idea collection service destroy'));
      clearVotingDoneStub = this.stub(clearVotingDone)
      .returns(Promise.resolve('Called KeyValService clearVotingDone'));
      stateCreateIdeaCollectionsStub = this.stub(createIdeaCollections)
      .returns(Promise.resolve('Called state service createIdeaCollections'));
    });

    it('Should remove current idea collections and create results', () => {
      return expect(finishVoting(BOARDID, false, '')).to.be.fulfilled
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

  xdescribe('#isRoomReady(votingAction, boardId)', () => {
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
      getUsersInRoomStub = this.stub(getUsersInRoom)
      .returns(Promise.resolve(users));
      startVotingStub = this.stub(startVoting)
      .returns(Promise.resolve('start voting called'));
      finishVotingStub = this.stub(finishVoting)
      .returns(Promise.resolve('finish voting called'));
    });

    afterEach((done) => {
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    it('Should result in the room not being ready to vote', function() {
      requiredState = StateEnum.createIdeaCollections;

      isUserReadyToVoteStub = this.stub(isUserReadyToVote)
      .returns(Promise.resolve(false));

      getStateStub = this.stub(getState)
      .returns(Promise.resolve(requiredState));

      return expect(isRoomReady('start', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserReadyToVoteStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(startVotingStub).to.not.have.been.called;
        expect(readyToVote).to.be.false;
      });
    });

    it('Should result in the room being ready to vote', function() {
      requiredState = StateEnum.createIdeaCollections;

      isUserReadyToVoteStub = this.stub(isUserReadyToVote)
      .returns(Promise.resolve(true));

      getStateStub = this.stub(getState)
      .returns(Promise.resolve(requiredState));

      return expect(isRoomReady('start', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserReadyToVoteStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(startVotingStub).to.have.been.called;
        expect(readyToVote).to.be.true;
      });
    });

    it('Should result in the room not being ready to finish voting', function() {
      requiredState = StateEnum.voteOnIdeaCollections;

      isUserDoneVotingStub = this.stub(isUserDoneVoting)
      .returns(Promise.resolve(false));

      getStateStub = this.stub(getState)
      .returns(Promise.resolve(requiredState));

      return expect(isRoomReady('finish', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserDoneVotingStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(finishVotingStub).to.have.not.been.called;
        expect(readyToVote).to.be.false;
      });
    });

    it('Should result in the room being ready to finish voting', function() {
      requiredState = StateEnum.voteOnIdeaCollections;

      isUserDoneVotingStub = this.stub(isUserDoneVoting)
      .returns(Promise.resolve(true));

      getStateStub = this.stub(getState)
      .returns(Promise.resolve(requiredState));

      return expect(isRoomReady('finish', BOARDID)).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersInRoomStub).to.have.returned;
        expect(isUserDoneVotingStub).to.have.returned;
        expect(getStateStub).to.have.returned;
        expect(finishVotingStub).to.have.been.called;
        expect(readyToVote).to.be.true;
      });
    });
  });

  xdescribe('#isUserReady(votingAction, boardId, userId)', () => {
    let getUsersReadyToVoteStub;
    let getUsersDoneVotingStub;

    const users = ['user1', 'user2'];

    before(function() {
      getUsersReadyToVoteStub = this.stub(getUsersReadyToVote)
      .returns(Promise.resolve(users));
      getUsersDoneVotingStub = this.stub(getUsersDoneVoting)
      .returns(Promise.resolve(users));
    });

    it('Should not have the user be ready to vote', () => {
      return expect(isUserReady('start', BOARDID, 'user3')).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersReadyToVoteStub).to.have.returned;
        expect(readyToVote).to.be.false;
      });
    });

    it('Should have the user be ready to vote', () => {
      return expect(isUserReady('start', BOARDID, 'user2')).to.be.fulfilled
      .then((readyToVote) => {
        expect(getUsersReadyToVoteStub).to.have.returned;
        expect(readyToVote).to.be.true;
      });
    });

    it('Should have the user not be ready to finish voting', () => {
      return expect(isUserReady('finish', BOARDID, 'user3')).to.be.fulfilled
      .then((finishedVoting) => {
        expect(getUsersDoneVotingStub).to.have.returned;
        expect(finishedVoting).to.be.false;
      });
    });

    it('Should have the user be ready to finish voting', () => {
      return expect(isUserReady('finish', BOARDID, 'user2')).to.be.fulfilled
      .then((finishedVoting) => {
        expect(getUsersDoneVotingStub).to.have.returned;
        expect(finishedVoting).to.be.true;
      });
    });
  });

  xdescribe('#setUserReady(votingAction, boardId, userId)', () => {
    const USERID = 'user1';
    let readyUserToVoteStub;
    let readyUserDoneVotingStub;
    let isRoomReadyStub;

    before(function() {
      readyUserToVoteStub = this.stub(readyUserToVote)
      .returns(Promise.resolve('readyUserToVote was called'));
      readyUserDoneVotingStub = this.stub(readyUserDoneVoting)
      .returns(Promise.resolve('readyUserDoneVoting was called'));
      isRoomReadyStub = this.stub(isRoomReady)
      .returns(Promise.resolve('isRoomReady was called'));
    });

    afterEach((done) => {
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    it('Should set the user ready to vote', () => {
      return expect(setUserReady('start', BOARDID, USERID)).to.be.fulfilled
      .then(() => {
        expect(readyUserToVoteStub).to.have.returned;
        expect(isRoomReadyStub).to.have.returned;
      });
    });

    it('Should set the user ready to finish voting', () => {
      return expect(setUserReady('finish', BOARDID, USERID)).to.be.fulfilled
      .then(() => {
        expect(readyUserDoneVotingStub).to.have.returned;
        expect(isRoomReadyStub).to.have.returned;
      });
    });
  });

  xdescribe('#setUserReadyToVote(boardId, userId)', function() {
    let checkUserVotingListExistsStub;
    let isUserReadyToVoteStub;
    const USERID = 'user1';

    afterEach((done) => {
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    it('Should reject the user from readying up to vote again', function() {
      checkUserVotingListExistsStub = this.stub(checkUserVotingListExists)
      .returns(Promise.resolve(false));

      isUserReadyToVoteStub = this.stub(isUserReadyToVote)
      .returns(Promise.resolve(true));

      return expect(setUserReadyToVote(BOARDID))
        .to.be.rejectedWith(UnauthorizedError,
        /User is already ready to vote./)
        .then(() => {
          expect(checkUserVotingListExistsStub).to.have.returned;
          expect(isUserReadyToVoteStub).to.have.returned;
        });
    });
  });

  xdescribe('#setUserReadyToFinishVoting(boardId, userId)', function() {
    let isUserDoneVotingStub;
    const USERID = 'user1';

    it('Should reject the user from readying to finish voting again', function() {
      isUserDoneVotingStub = this.stub(isUserDoneVoting)
      .returns(Promise.resolve(true));

      return expect(setUserReadyToFinishVoting(BOARDID, USERID))
      .to.be.rejectedWith(UnauthorizedError,
      /User is already ready to finish voting/)
      .then(() => {
        expect(isUserDoneVotingStub).to.have.returned;
      });
    });
  });

  xdescribe('#getVoteList(boardId, userId)', () => {
    const USERID = 'user1';
    let checkUserVotingListExistsStub;
    let isUserDoneVotingStub;
    let getIdeaCollectionsStub;
    let addToUserVotingListStub;
    let getCollectionsToVoteOnStub;
    let findByKeyStub;

    const collectionObjs = [
      {key: 'abc123'},
      {key: 'abc1234'},
    ];

    const collectionKeys = ['abc123', 'abc1234'];

    const collectionPromises = [Promise.resolve({key: 'abc1234'}),
                      Promise.resolve({key: 'abc1234'})];

    before(function() {
      getIdeaCollectionsStub = this.stub(getIdeaCollections)
      .returns(Promise.resolve(collectionObjs));
      addToUserVotingListStub = this.stub(addToUserVotingList)
      .returns(Promise.resolve(collectionKeys));
      getCollectionsToVoteOnStub = this.stub(getCollectionsToVoteOn)
      .returns(Promise.resolve(collectionKeys));
      findByKeyStub = this.stub(IdeaCollection, 'findByKey')
      .returns(Promise.resolve(collectionPromises));
    });

    afterEach((done) => {
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    // Check to see if a user hasn't voted yet and generates the list of
    // collections to vote on and stores them in Redis.
    xit('Should create a new voting list with all the idea collections', function() {
      checkUserVotingListExistsStub = this.stub(checkUserVotingListExists)
      .returns(Promise.resolve(false));

      isUserDoneVotingStub = this.stub(isUserDoneVoting)
      .returns(Promise.resolve(false));

      return expect(getVoteList(BOARDID, USERID)).to.be.fulfilled
      .then((collectionsToVoteOn) => {
        expect(checkUserVotingListExistsStub).to.have.returned;
        expect(isUserDoneVotingStub).to.have.returned;
        expect(getIdeaCollectionsStub).to.have.returned;
        expect(addToUserVotingListStub).to.have.returned;
        expect(collectionsToVoteOn).to.have.length(2);
      });
    });

    // In this case, the user has already voted and is done voting so we look
    // to send back just an empty collection
    it('Should return an empty collection since the user is done voting', function() {
      checkUserVotingListExistsStub = this.stub(checkUserVotingListExists)
      .returns(Promise.resolve(false));

      isUserDoneVotingStub = this.stub(isUserDoneVoting)
      .returns(Promise.resolve(true));

      return expect(getVoteList(BOARDID, USERID)).to.be.fulfilled
      .then((collectionsToVoteOn) => {
        expect(checkUserVotingListExistsStub).to.have.returned;
        expect(isUserDoneVotingStub).to.have.returned;
        expect(getIdeaCollectionsStub).to.have.returned;
        expect(addToUserVotingListStub).to.have.returned;
        expect(collectionsToVoteOn).to.have.length(0);
      });
    });

    // In this case, the user has started voting, but hasn't finished yet so
    // we get their remaining collection keys from Redis and generate them
    it('Should return remaining idea collections to vote on', function() {
      checkUserVotingListExistsStub = this.stub(checkUserVotingListExists)
      .returns(Promise.resolve(true));

      return expect(getVoteList(BOARDID, USERID)).to.be.fulfilled
      .then((collectionsToVoteOn) => {
        expect(checkUserVotingListExistsStub).to.have.returned;
        expect(getCollectionsToVoteOnStub).to.have.returned;
        expect(findByKeyStub).to.have.returned;
        expect(collectionsToVoteOn).to.have.length(2);
      });
    });
  });

  xdescribe('#vote(boardId, userId, key, increment)', () => {
    const USERID = 'user1';
    let findOneAndUpdateStub;
    let removeFromUserVotingListStub;
    let wasCollectionVotedOnStub;
    let getCollectionsToVoteOnStub;
    let setUserReadyToFinishVotingStub;

    const collectionKeys = ['abc123', 'abc1234'];
    const emptyCollection = [];

    before(function() {
      findOneAndUpdateStub = this.stub(IdeaCollection, 'findOneAndUpdate')
      .returns(Promise.resolve('findOneAndUpdate was called'));
      removeFromUserVotingListStub = this.stub(removeFromUserVotingList)
      .returns(Promise.resolve('removeFromUserVotingList was called'));
      setUserReadyToFinishVotingStub = this.stub(setUserReadyToFinishVoting)
      .returns(Promise.resolve(true));
    });

    afterEach((done) => {
      resetRedis(USERID)
      .then(() => {
        done();
      });
    });

    it('Should vote on a collection, increment it and set user ready to finish', function() {
      getCollectionsToVoteOnStub = this.stub(getCollectionsToVoteOn)
      .returns(Promise.resolve(emptyCollection));

      wasCollectionVotedOnStub = this.stub(wasCollectionVotedOn)
      .returns(Promise.resolve('wasCollectionVotedOn was called'));

      return expect(vote(BOARDID, USERID, 'key', true)).to.be.fulfilled
      .then((setUserReady) => {
        expect(wasCollectionVotedOnStub).to.have.returned;
        expect(findOneAndUpdateStub).to.have.returned;
        expect(removeFromUserVotingListStub).to.have.returned;
        expect(getCollectionsToVoteOnStub).to.have.returned;
        expect(setUserReadyToFinishVotingStub).to.have.returned;
        expect(setUserReady).to.be.true;
      });
    });

    it('Should vote on a collection and not increment it', function() {
      getCollectionsToVoteOnStub = this.stub(getCollectionsToVoteOn)
      .returns(Promise.resolve(collectionKeys));

      wasCollectionVotedOnStub = this.stub(wasCollectionVotedOn)
      .returns(Promise.resolve('wasCollectionVotedOn was called'));

      return expect(vote(BOARDID, USERID, 'key', true)).to.be.fulfilled
      .then((setUserReady) => {
        expect(findOneAndUpdateStub).to.have.returned;
        expect(removeFromUserVotingListStub).to.have.returned;
        expect(getCollectionsToVoteOnStub).to.have.returned;
        expect(setUserReady).to.be.false;
      });
    });

    it('Should not allow a duplicate vote to occur', function() {
      return expect(vote(BOARDID, USERID, 'key', true))
        .to.be.rejectedWith(UnauthorizedError,
        /Collection was already voted on or does not exist/);
    });
  });

  describe('#getResults(boardId)', () => {

    beforeEach((done) => {
      return monky.create('Board', {boardId: BOARDID})
      .then(() => {
        return Promise.all([
          monky.create('Idea', {boardId: BOARDID, content: 'idea1'}),
          monky.create('Idea', {boardId: BOARDID, content: 'idea2'}),
        ]);
      })
      .then((allIdeas) => {
        return Promise.all([
          monky.create('Result', {key: 'resultOne', boardId: BOARDID, ideas: allIdeas}),
          monky.create('Result', {key: 'resultTwo', boardId: BOARDID, ideas: [allIdeas[0]]}),
        ]);
      })
      .then(() => {
        done();
      });
    });

    it('Should get all of the results on a board ', (done) => {
      return getResults(BOARDID)
      .then((results) => {
        expect(_.keys(results)).to.have.length(1);
        expect(_.keys(results[0])).to.have.length(2);
        done();
      });
    });
  });
});
