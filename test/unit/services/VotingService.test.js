import chai from 'chai';
import mochaMongoose from 'mocha-mongoose';
import CFG from '../../../config';
import Monky from 'monky';
import Promise from 'bluebird';
import _ from 'lodash';
import database from '../../../api/services/database';
import VotingService from '../../../api/services/VotingService';
import RedisService from '../../../api/services/RedisService';
import BoardService from '../../../api/services/BoardService';

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
      clearDB(done);
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
      clearDB(done);
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

  describe('#isRoomReady(boardId)', () => {
    const user = 'user43243';

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join('1', user),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del('1-current-users'),
        RedisService.del('1-ready'),
        RedisService.del('1-state'),
      ])
      .then(() => {
        clearDB(done);
      });
    });

    it('Should show that the room is not ready to vote/finish voting', (done) => {
      VotingService.isRoomReady('1')
      .then((isRoomReady) => {
        expect(isRoomReady).to.be.false;
        done();
      });
    });

    it('Should check if all connected users are ready to vote/finish voting', (done) => {
      VotingService.setUserReady('1', user)
      .then((isRoomReady) => {
        expect(isRoomReady).to.be.true;
        done();
      });
    });
  });

  describe('#getVoteList(boardId, userId)', () => {
    const user = 'user43243';

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join('1', user),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del('1-current-users'),
        RedisService.del('1-ready'),
        RedisService.del('1-voting-' + user),
      ])
      .then(() => {
        clearDB(done);
      });
    });

    it('Should add the collections to vote on into Redis and return them', (done) => {
      VotingService.getVoteList('1', user)
      .then((collections) => {
        expect(_.keys(collections)).to.have.length(1);
        done();
      });
    });

    it('Should return the remaining collections to vote on', (done) => {
      // Set up the voting list in Redis
      VotingService.getVoteList('1', user)
      .then(() => {
        VotingService.vote('1', user, 'abc123', false)
        .then(() => {
          VotingService.getVoteList('1', user)
          .then((collections) => {
            expect(collections).to.have.length(0);
            done();
          });
        });
      });
    });
  });

  describe('#vote(boardId, userId, key, increment)', () => {
    const user = 'user43243';

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join('1', user),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del('1-current-users'),
        RedisService.del('1-ready'),
        RedisService.del('1-voting-' + user),
      ])
      .then(() => {
        clearDB(done);
      });
    });

    it('Should vote on a collection and not increment the vote', (done) => {
      VotingService.getVoteList('1', user)
      .then(() => {
        VotingService.vote('1', user, 'abc123', false)
        .then((success) => {

          // Momentarily we send back true as a response to a successful vote
          // If there are no collections left to vote on it sets the user ready
          // Either way this is true so how do we differentiate? By Events?
          expect(success).to.be.true;

          // Have to query for the idea collection we voted on again since votes are stripped
          IdeaCollection.findOne({boardId: '1', key: 'abc123'})
          .then((collection) => {
            expect(collection.votes).to.equal(0);
            done();
          });
        });
      });
    });

    it('Should vote on a collection and increment the vote', (done) => {
      VotingService.getVoteList('1', user)
      .then(() => {
        VotingService.vote('1', user, 'abc123', true)
        .then((success) => {
          expect(success).to.be.true;
          IdeaCollection.findOne({boardId: '1', key: 'abc123'})
          .then((collection) => {
            expect(collection.votes).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('#getResults(boardId)', () => {
    const user = 'user43243';

    beforeEach((done) => {
      Promise.all([
        monky.create('Board', {boardId: '1'}),

        Promise.all([
          monky.create('Idea', {boardId: '1', content: 'idea1'}),
          monky.create('Idea', {boardId: '1', content: 'idea2'}),
        ])
        .then((allIdeas) => {
          Promise.all([
            BoardService.join('1', user),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas, key: 'abc123'}),
            monky.create('IdeaCollection', {boardId: '1', ideas: allIdeas[0], key: 'def456'}),
          ]);
        }),
      ])
      .then(() => {
        done();
      });
    });

    afterEach((done) => {
      Promise.all([
        RedisService.del('1-current-users'),
        RedisService.del('1-ready'),
        RedisService.del('1-voting-' + user),
      ])
      .then(() => {
        clearDB(done);
      });
    });

    it('Should get all of the results on a board ', (done) => {
      VotingService.finishVoting('1')
      .then(() => {
        VotingService.getResults('1')
        .then((results) => {
          expect(_.keys(results)).to.have.length(1);
          expect(_.keys(results[0])).to.have.length(2);
          done();
        });
      });
    });
  });
});
