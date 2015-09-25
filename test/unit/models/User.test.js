const expect = require('chai').expect;

describe.only('UserModel', function() {

	describe('#find()', function() {

		it('Should check the find function', function(done) {

			User.find()	

			.then(function(results) {

				done();
			})

			.catch(done);
		});	
	});

	describe('#create()', function() {

		it('Should create a user', function(done) {

			User.create({

				isFullAccount: false,
				username: 'braxtonissokewl',
				password: 'ransomfont',
				email: 'braxtoniskewl@kewlmail.com',
			})

			.then(function(user) {

				expect(user.isFullAccount).to.be.a('boolean');
				expect(user.username).to.be.a('string');
				expect(user.password).to.be.a('string');
				expect(user.email).to.be.a('string');

				done();
			})

			.catch(done);
		});
	});

	describe('#update()', function() {

		it('Should update a user', function(done) {

			User.update({username:'braxtonissokewl'}, {username: 'braxtonissonotkewl'})

			.then(function() {

				done();
			})

			.catch(done);
		});
	});

	describe('#destroy()', function() {

		it ('Should destroy a user', function(done) {

			User.destroy({username:'braxtonissonotkewl'})

			.then(function() {

				done();
			})

			.catch(done);
		});
	});
});