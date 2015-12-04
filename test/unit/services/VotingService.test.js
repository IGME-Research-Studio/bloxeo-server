import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mochaMongoose from 'mocha-mongoose';
import Monky from 'monky';
import Promise from 'bluebird';
import CFG from '../../../config';
import database from '../../../api/services/database';
import VotingService from '../../../api/services/VotingService.js';

chai.use(chaiAsPromised);
const expect = chai.expect;
const mongoose = database();
const clearDB = mochaMongoose(CFG.mongoURL, {noClear: true});
const monky = new Monky(mongoose);

const userId = 'user123';

mongoose.model('Board', require('../../../api/models/Board').schema);
mongoose.model('Idea', require('../../../api/models/Idea').schema);
mongoose.model('IdeaCollection', require('../../../api/models/IdeaCollection').schema);
mongoose.model('Result', require('../../../api/models/Result').schema);

describe('VotingService', function() {

  before((done) => {
    database(done);
  });

  describe('#startVoting(boardId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should increment round and remove duplicate collections', (done) => {

    });
  });

  describe('#finishVoting(boardId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should remove current idea collections and create results', (done) => {

    });
  });

  describe('#setUserReady(boardId, userId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should push the user into the ready list in Redis', (done) => {

    });
  });

  describe('#isRoomReady(boardId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should check if all connected users are ready to move forward', (done) => {

    });
  });

  describe('#isUserReady(boardId, userId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should check to see if connected user is ready to move forward', (done) => {

    });
  });

  describe('#getVoteList(boardId, userId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should get the remaining collections to vote on', (done) => {

    });
  });

  describe('#vote(boardId, userId, key, increment)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should vote on a collection ', (done) => {

    });
  });

  describe('#getResults(boardId)', () => {
    let round;
    let key;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        })
        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas})
        });
      ])
      .then(() => {
        IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2');
        })
      });
    });

    afterEach((done) {
      clearDB(done);
    });

    it('Should get all of the results on a board ', (done) => {

    });
  });
});
