const expect = require('chai').expect;

describe('IdeaModel', function() {

	describe('#find()', function() {

		it('Should check the find function', function(done) {

			Idea.find()	

			.then(function(results) {

				done();
			})

			.catch(done);
		});	
	});

	describe('#create()', function() {

		it('Should create an Idea', function(done) {

			Idea.create({

				content: 'Purple',
			})

			.then(function(idea) {

				expect(idea.content).to.be.a('string');

				done();
			})

			.catch(done);
		});
	});

	describe('#update()', function() {

		it('Should update an Idea', function(done) {

			Idea.update({content:'Purple'}, {content:'Green'})

			.then(function() {

				done();
			})

			.catch(done);
		});
	});

	describe('#destroy()', function() {

		it ('Should destroy an Idea', function(done) {

			Idea.destroy({content:'Green'})

			.then(function() {

				done();
			})

			.catch(done);
		});
	});
});