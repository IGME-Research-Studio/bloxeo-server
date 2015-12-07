import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinomocha from 'sinomocha';
import _ from 'lodash';
import Promise from 'bluebird';

import index from '../../../api/handlers/v1/ideaCollections/index';
import create from '../../../api/handlers/v1/ideaCollections/create';
import destroy from '../../../api/handlers/v1/ideaCollections/destroy';
// import addIdea from '../../../api/handlers/v1/ideaCollections/addIdea';
// import removeIdea from '../../../api/handlers/v1/ideaCollections/removeIdea';

import IdeaCollectionService from '../../../api/services/IdeaCollectionService';
import stream from '../../../api/event-stream';
import EXT_EVENTS from '../../../api/constants/EXT_EVENT_API';

chai.use(chaiAsPromised);
chai.use(sinonChai);
sinomocha();
const expect = chai.expect;

const [IDEA_1, IDEA_2, IDEA_3, IDEA_4] = [1, 2, 3, 4].map((n) => ({_id: n, content: n}));
const [RES_IDEA_1, RES_IDEA_2, RES_IDEA_3, RES_IDEA_4] = [1, 2, 3, 4].map((n) => ({content: n}));
const REQ_COLLECTIONS = {
  1: {_id: 1, key: 1, ideas: [IDEA_1, IDEA_2]},
  2: {_id: 2, key: 2, ideas: [IDEA_3, IDEA_4]},
};
const REQ_OBJ = {
  socket: {id: 1},
  boardId: '2a3bf23',
};
const RES_CREATED_COLLECTION = {key: 1, content: [RES_IDEA_1, RES_IDEA_2]};
const RES_UPDATED_COLLECTIONS = {
  1: {key: 1, ideas: [RES_IDEA_1, RES_IDEA_2]},
  2: {key: 2, ideas: [RES_IDEA_3, RES_IDEA_4]},
};

let getIdeaCollectionsStub;
let serverErrorStub;
let okStub;
let createStub;
let createdStub;
let badRequestStub;

describe('IdeaCollection handlers', function() {

  describe('#index({socketId, boardId})', function() {

    before(function() {
      getIdeaCollectionsStub = this.stub(IdeaCollectionService, 'getIdeaCollections');
      okStub = this.stub(stream, 'ok');
      serverErrorStub = this.stub(stream, 'serverError');
      badRequestStub = this.stub(stream, 'badRequest');
    });

    it('should broadcast an OK response with the correct data', function() {
      getIdeaCollectionsStub.returns(Promise.resolve(REQ_COLLECTIONS));

      return expect(index(REQ_OBJ))
        .to.be.fulfilled
        .then(() => {
          expect(serverErrorStub).to.not.have.been.called;
          expect(badRequestStub).to.not.have.been.called;
          expect(getIdeaCollectionsStub)
            .to.have.been.calledWith(REQ_OBJ.boardId);
          expect(okStub)
            .to.have.been.calledWith(EXT_EVENTS.RECEIVED_COLLECTIONS,
                                     RES_UPDATED_COLLECTIONS,
                                     REQ_OBJ.boardId);
        });
    });
  });

  describe('#create(req)', function() {

    before(function() {
      createStub = this.stub(IdeaCollectionService, 'create');
      createdStub = this.stub(stream, 'created');
      serverErrorStub = this.stub(stream, 'serverError');
      badRequestStub = this.stub(stream, 'badRequest');
    });

    it('should broadcast a created response with the correct data', () => {
      createStub.returns(Promise.resolve([RES_CREATED_COLLECTION,
                                        REQ_COLLECTIONS]));

      return expect(create(_.merge(REQ_OBJ, {userId: 2, content: 'ha'})))
        .to.be.fulfilled
        .then(() => {
          expect(serverErrorStub).to.not.have.been.called;
          expect(badRequestStub).to.not.have.been.called;
          expect(createStub)
            .to.have.been.calledWith(2, REQ_OBJ.boardId, 'ha');
          expect(createdStub)
            .to.have.been.calledWith(EXT_EVENTS.UPDATED_COLLECTIONS,
                                     RES_UPDATED_COLLECTIONS,
                                     REQ_OBJ.boardId);
        });
    });
  });

  describe('#destroy(req)', function() {
    let destroyStub;
    let okStub;

    before(function() {
      destroyStub = this.stub(IdeaCollectionService, 'destroy');
      okStub = this.stub(stream, 'ok');
      serverErrorStub = this.stub(stream, 'serverError');
      badRequestStub = this.stub(stream, 'badRequest');
    });

    it('should broadcast a created response with the correct data', function() {
      destroyStub.returns(Promise.resolve(REQ_COLLECTIONS));

      return expect(destroy(_.merge(REQ_OBJ, {key: '2'})))
        .to.be.fulfilled
        .then(() => {
          expect(destroyStub)
            .to.have.been.calledWith(REQ_OBJ.boardId, '2');
          expect(serverErrorStub).to.not.have.been.called;
          expect(badRequestStub).to.not.have.been.called;
          expect(okStub)
            .to.have.been.calledWith(EXT_EVENTS.UPDATED_COLLECTIONS,
                                     RES_UPDATED_COLLECTIONS,
                                     REQ_OBJ.boardId);
        });
    });
  });

  describe('#addIdea(req)', () => {
  });

  describe('#removeIdea(req)', () => {
  });
});

