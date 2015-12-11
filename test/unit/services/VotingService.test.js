import chai from 'chai';
import mochaMongoose from 'mocha-mongoose';
import CFG from '../../../config';
import Monky from 'monky';
import Promise from 'bluebird';
import database from '../../../api/services/database';
import IdeaCollectionService from '../../../api/services/IdeaCollectionService';
import VotingService from '../../../api/services/VotingService';
import RedisService from '../../../api/services/RedisService';

const expect = chai.expect;
const mongoose = database();
const clearDB = mochaMongoose(CFG.mongoURL, {noClear: true});
const monky = new Monky(mongoose);

import {model as Board} from '../../../api/models/Board';
import {model as IdeaCollection} from '../../../api/models/IdeaCollection';
import {model as Result} from '../../../api/models/Result';

mongoose.model('Board', require('../../../api/models/Board').schema);
mongoose.model('Idea', require('../../../api/models/Idea').schema);
mongoose.model('IdeaCollection', require('../../../api/models/IdeaCollection').schema);
mongoose.model('Result', require('../../../api/models/Result').schema);

monky.factory('Board', {boardId: '1'});
monky.factory('Idea', {boardId: '1', content: 'idea1'});
monky.factory('IdeaCollection', {boardId: '1'});

// TODO: TAKE OUT TESTS INVOLVING ONLY REDIS COMMANDS
// TODO: USE STUBS ON MORE COMPLICATED FUNCTIONS WITH REDIS COMMANDS

describe('VotingService', function() {

  before((done) => {
    database(done);
  });

  describe('#startVoting(boardId)', () => {
    let round;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        }),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'def456'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    it('Should increment round', (done) => {
      VotingService.startVoting('1')
      .then(() => {
        return Board.findOne({boardId: '1'})
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
        monky.create('Board', {boardId: '1'}),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    it('Should remove current idea collections and create results', (done) => {
      VotingService.finishVoting('1')
      .then(() => {
        Promise.all([
          IdeaCollection.find({boardId: '1'}),
          Result.find({boardId: '1'}),
        ])
        .spread((collections, results) => {
          expect(collections).to.have.length(0);
          expect(results).to.have.length(1);
          done();
        });
      });
    });
  });

  describe('#setUserReady(boardId, userId)', () => {

    beforeEach((done) => {
      monky.create('Board', {boardId: '1'})
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    it('Should push the user into the ready list on Redis', (done) => {
      let userId = 'abc123';

      VotingService.setUserReady('1', userId)
      .then(() => {
        RedisService.sadd('1-voting-ready', userId)
        .then((numKeysAdded) => {
          expect(numKeysAdded).to.equal(1);
          done();
        });
      });
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
        }),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas});
        }),
      ])
      .then(() => {
        return IdeaCollectionService.create('1', 'idea1')
        .then((result) => {
          key = Object.keys(result)[0];
          IdeaCollectionService.addIdea('1', key, 'idea2')
          .then(() => {
            done();
          });
        });
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    xit('Should check if all connected users are ready to move forward', (done) => {
      // Can't be implemented until Board.getConnectedUsers is implemented in Board model
    });
  });

  describe('#isUserReady(boardId, userId)', () => {

    beforeEach((done) => {
      monky.create('Board', {boardId: '1'})
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      clearDB(done);
    });

    it('Should check to see if connected user is ready to move forward', (done) => {
      let userId = 'def456';

      VotingService.isUserReady('1', userId)
      .then((isUserReady) => {
        RedisService.sadd('1-voting-ready', userId)
        .then(() => {
          expect(isUserReady).to.be.true;
          done();
        });
      });
    });
  });

  describe('#getVoteList(boardId, userId)', () => {
    let round;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        }),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'def456'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    xit('Should get the remaining collections to vote on', (done) => {

    });
  });

  describe('#vote(boardId, userId, key, increment)', () => {
    let round;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        }),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'def456'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    xit('Should vote on a collection ', (done) => {

    });
  });

  describe('#getResults(boardId)', () => {
    let round;

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'})
        .then((result) => {
          round = result.round;
        }),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'def456'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      RedisService.flushAll()
      .then(() => clearDB(done));
    });

    xit('Should get all of the results on a board ', (done) => {

    });
  });
});
