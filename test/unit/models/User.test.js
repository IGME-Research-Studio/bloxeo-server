const expect = require('chai').expect;
const should = require('chai').should();

describe('UserModel', () => {

  describe('#create()', () => {

    it('Should create a full user', (done) => {

      User.create({

        isFullAccount: true,
        username: 'braxtonissokewl',
        password: 'ransomfont',
        email: 'braxtoniskewl@kewlmail.com',
      })

      .then((user) => {

        expect(user.isFullAccount).to.be.a('boolean');
        expect(user.username).to.be.a('string');
        expect(user.password).to.be.a('string');
        expect(user.email).to.be.a('string');

        done();
      })

      .catch(done);
    });

    it('Should create a temp user', (done) => {

      User.create({

        isFullAccount: false,
        username: 'cheese',
      })

      .then((user) => {

        expect(user.isFullAccount).to.be.a('boolean');
        expect(user.username).to.be.a('string');

        done();
      })

      .catch(done);
    });

    it('Should not create an incomplete user', (done) => {

      User.create({

        isFullAccount: true,
        username: 'nickers',
        email: 'braxtonissokewl@yahoo.com',
      })

      .exec(function(err, user) {

        should.exist(err);
        should.not.exist(user);

        done();
      });
    });
  });

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      User.find()

        .then((users) => {
          for (let i = 0; i < users.length; i++) {
            expect(users[i].isFullAccount).to.be.a('boolean');
            expect(users[i].username).to.be.a('string');
          }
          done();
        })

      .catch(done);
    });
  });

  describe('#findOne()', () => {

    it('Should check the findOne function', (done) => {

      User.findOne({username: 'braxtonissokewl'})

        .then((user) => {
          expect(user.username).is.equal('braxtonissokewl');
          done();
        })

      .catch(done);
    });
  });

  describe('#update()', () => {

    it('Should update a user', (done) => {

      User.update({username: 'braxtonissokewl'},
                  {username: 'braxtonissonotkewl'})

        .then(() => {

          done();
        })

      .catch(done);
    });
  });

  describe('#destroy()', () => {

    it('Should destroy a user', (done) => {

      User.destroy({username: 'braxtonissonotkewl'})

        .then(() => {

          done();
        })

      .catch(done);
    });
  });
});
