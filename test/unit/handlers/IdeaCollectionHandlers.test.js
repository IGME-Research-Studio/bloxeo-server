import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import _ from 'lodash';
import Promise from 'bluebird';
import { isntNull } from '../../../api/services/ValidatorService';

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
const expect = chai.expect;

let IdeaCollectionServiceStub;
let streamStub;

const REQ_COLLECTIONS = {
  1: {_id: 1, key: 1, content: [1, 2]},
  2: {_id: 2, key: 2, content: [1, 4]},
};
const REQ_OBJ = {
  socket: {id: 1},
  boardId: '2a3bf23',
};
const RES_CREATED_COLLECTION = {key: 1, content: [1, 2]};
const RES_UPDATED_COLLECTIONS = {
  1: {key: 1, content: [1, 2]},
  2: {key: 2, content: [1, 4]},
};

const setupStubs = () => {
  IdeaCollectionServiceStub = sinon.stub(IdeaCollectionService);
  streamStub = sinon.stub(stream);
};

const restoreStub = (stub) => {
  if (_.has(stub, 'restore')) stub.restore();
};

const teardownStubs = () => {
  _.forEach(IdeaCollectionServiceStub, restoreStub);
  _.forEach(streamStub, restoreStub);
};

describe('IdeaCollection handlers', () => {
  before(setupStubs);
  after(teardownStubs);

  describe('#index({socketId, boardId})', () => {

    it('should broadcast an OK response with the correct data', () => {
      IdeaCollectionServiceStub
        .getIdeaCollections.returns(Promise.resolve(REQ_COLLECTIONS));

      return expect(index(REQ_OBJ))
        .to.be.fulfilled
        .then(() => {
          expect(IdeaCollectionServiceStub.getIdeaCollections)
            .to.have.been.calledWith(REQ_OBJ.boardId);
          expect(streamStub.ok)
            .to.have.been.calledWith(EXT_EVENTS.RECEIVED_COLLECTIONS,
                                     RES_UPDATED_COLLECTIONS,
                                     REQ_OBJ.boardId);
        });
    });
  });

  describe('#create(req)', () => {

    xit('should broadcast a created response with the correct data', () => {
      IdeaCollectionServiceStub
        .create.returns(Promise.resolve([RES_CREATED_COLLECTION,
                                        REQ_COLLECTIONS]));

      return expect(create(_.merge(REQ_OBJ, {userId: 2, content: 'ha'})))
        .to.be.fulfilled
        .then(() => {
          expect(IdeaCollectionServiceStub.create)
            .to.have.been.calledWith(2, REQ_OBJ.boardId, 'ha');
          expect(streamStub.created)
            .to.have.been.calledWith(EXT_EVENTS.UPDATED_COLLECTIONS,
                                     RES_UPDATED_COLLECTIONS,
                                     REQ_OBJ.boardId);
        });
    });
  });

  describe('#destroy(req)', () => {

    it('should broadcast a created response with the correct data', () => {
      IdeaCollectionServiceStub
        .destroy.returns(Promise.resolve(REQ_COLLECTIONS));

      return expect(destroy(_.merge(REQ_OBJ, {key: '2'})))
        .to.be.fulfilled
        .then(() => {
          expect(IdeaCollectionServiceStub.destroy)
            .to.have.been.calledWith(REQ_OBJ.boardId, '2');
          expect(streamStub.ok)
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

