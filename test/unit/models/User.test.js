const expect = require('chai').expect;

describe('UserModel', () => {

  describe('#find()', () => {

    it('Should check the find function', (done) => {

      User.find()

        .then(() => {
          done();
        })

      .catch(done);
    });
  });

  describe('#create()', () => {

    it('Should create a user', (done) => {

      User.create({

        isFullAccount: false,
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
