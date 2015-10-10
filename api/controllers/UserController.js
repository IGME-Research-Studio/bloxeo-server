/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	createUser: function(req, res) {

		User.create({isFullAccount: false}).exec(function (err, created) {

			var id = created.id;
			var socketId = sails.sockets.id(req.socket);

			res.json({

				message: 'Server: User created with uuid: ' + id,
				uuid: id,
				userSocketId: socketId,
			})
		});
	},
};

