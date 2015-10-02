var roomModel = "../models/Room.js";

/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	createRoom: function(req, res) {

		roomModel.create({}).exec(function(err, created) {

			res.json({

				message: 'Room created.',
			});
		});
	},

	joinRoom: function(req, res) {

		var roomId = req.param('roomId');

		sails.sockets.join(req.socket, roomId);

		res.json({

			message: 'User subscribed to: ' + roomId,
		});
	},
};

