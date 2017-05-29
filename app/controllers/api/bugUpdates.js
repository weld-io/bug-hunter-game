'use strict';

var mongoose = require('mongoose');
var BugUpdate = mongoose.model('BugUpdate');

var API_PASSWORD = process.env.UPTODATER_PASSWORD;

module.exports = {

	list: function (req, res, next) {
		var searchQuery = {};
		if (req.query.from) {
			var currentTime = new Date();
			searchQuery = { dateCreated: { "$gte": new Date(req.query.from), "$lt": currentTime } };
		}

		BugUpdate.find(searchQuery, null, { sort: { dateCreated: -1 } }, function (err, updates) {
			if (err) {
				return res.json(400, err);
			}
			else {
				return res.json(updates);
			}
		});
	},

	// Create new update
	create: function (req, res, next) {
		var newBugUpdate = new BugUpdate(req.body);
		newBugUpdate.save(function (err) {
			if (err) {
				return res.json(400, err);
			}
			else {
				return res.json(newBugUpdate);
			}
		});
	},

	// Create new GitHub Issue
	createGithubIssue: function (req, res, next) {
		console.log('**CREATE GH', req.body);
		var newBugUpdate = new BugUpdate(req.body);
		newBugUpdate.save(function (err) {
			if (err) {
				return res.json(400, err);
			}
			else {
				return res.json(newBugUpdate);
			}
		});
	},

	// BugUpdate update
	update: function (req, res, next) {
		BugUpdate.update(
			{ _id: req.params.id },
			req.body,
			function (updateErr, numberAffected, rawResponse) {
				if (updateErr) {
					res.json(500, updateErr);
				}
				else {
					res.json(200, 'BugUpdated update ' + req.params.id);
				}
			}
		);
	},

	// Delete update
	delete: function (req, res, next) {
		var searchParams;
		if (req.params.id === 'ALL') {
			searchParams = {};
		}
		else {
			searchParams = { _id: req.params.id }
		}

		BugUpdate.remove(
			searchParams,
			function(updateErr, numberAffected, rawResponse) {
				if (updateErr) {
					res.json(500, updateErr);
				}
				else {
					res.json(200, 'Deleted ' + numberAffected + ' updates');
				}
			}
		);
	},

}