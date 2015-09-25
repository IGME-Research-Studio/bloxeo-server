const expect = require('chai').expect;

describe.only('RoomModel', function() {

	describe('#find()', function() {

		it('Should check the find function', function(done) {

			Room.find()	

			.then(function(results) {

				done();
			})

			.catch(done);
		});	
	});

	describe('#create()', function() {

		it('Should create a Room', function(done) {

			Room.create({

				roomID: 'abc123',
			})

			.then(function(room) {

				expect(room.roomID).to.be.a('string');

				done();
			})

			.catch(done);
		});
	});

	describe('#update()', function() {

		it('Should update a Room', function(done) {

			Room.update({roomID:'abc123'}, {roomID:'abc12345'})

			.then(function() {

				done();
			})

			.catch(done);
		});
	});

	describe('#destroy()', function() {

		it ('Should destroy a Room', function(done) {

			Room.destroy({roomID:'abc12345'})

			.then(function() {

				done();
			})

			.catch(done);
		});
	});
});