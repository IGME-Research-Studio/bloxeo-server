var roomModel = "../models/Room.js";
var userModel = "../models/User.js";

/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// ToDo: Test responses from this and figure out how to send response to render view instead of just json responses

module.exports = {

	createRoom: function(req, res) {

		roomModel.create({}).exec(function(err, created) {

			res.json({

				message: 'Room created with room id: ' + created.roomId,
			});
		});
	},

	joinRoom: function(req, res) {

		var roomId = req.param('roomId');
		var userId = req.param('userId');

		sails.sockets.join(req.socket, roomId);

		res.json({

			message: 'User ' + userId + ' subscribed to: ' + roomId,
		});
	},
};

