'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');

var Bug = mongoose.model('Bug');
var BugUpdate = mongoose.model('BugUpdate');

const calculatePoints = function (action, bug) {
	var basePoints;
	switch (action) {
		case 'closed':
			basePoints = 50;
			break;
		case 'opened':
		case 'reopened':
			basePoints = 10;
			break;
		default:
			basePoints = 0;
			break;
		//case 'assigned':
		//case 'unassigned':
		//case 'labeled':
		//case 'unlabeled':
		//case 'edited':
		//case 'milestoned':
		//case 'demilestoned':
	}
	var priorityPoints = 1;
	if (_.includes(bug.labels, 'prio 1')) {
		priorityPoints = 3;
	}
	else if (_.includes(bug.labels, 'prio 2')) {
		priorityPoints = 2;
	}
	return basePoints * priorityPoints;
};

module.exports = {

	list: function (req, res, next) {
		var searchQuery = {};
		if (req.query.from) {
			var currentTime = new Date();
			searchQuery = { dateCreated: { "$gte": new Date(req.query.from), "$lt": currentTime } };
		}

		BugUpdate.find(searchQuery, null, { sort: { dateCreated: -1 } }, function (err, updates) {
			if (err) {
				return res.status(400).json(err);
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
				return res.status(400).json(err);
			}
			else {
				return res.json(newBugUpdate);
			}
		});
	},

	// Create new GitHub Issue
	createGithubIssue: function (req, res, next) {
		console.log('**CREATE GH', req.body);

		const validateGithubIssue = function (data, cb) {
			var err;
			if (!_.has(data, 'action')) {
				err = 'Missing property: action';
			}
			else if (!_.has(data, 'sender.login')) {
				err = 'Missing property: sender.login';
			}
			else if (!_.has(data, 'repository.id')) {
				err = 'Missing property: repository.id';
			}
			else if (!_.has(data, 'issue.id')) {
				err = 'Missing property: issue.id';
			}
			cb(err, data);
		};

		const createBug = function (data, cb) {
			// Convert issue to Bug
			var bugObj = _.merge({}, data.issue);
			bugObj.githubIssueId = data.issue.id;
			bugObj.githubRepositoryId = data.repository.id;
			bugObj.labels = _.map(data.issue.labels, 'name');
			Bug.findOrCreate({ githubIssueId: data.issue.id }, bugObj, function (err, bug, wasCreated) {
				if (wasCreated) {
					// New bug
					cb(err, data, bug);
				}
				else {
					// Update existing bug
					_.merge(bug, bugObj);
					bug.save(function (err, bug2) {
						cb(err, data, bug2);
					});
				}
			})
		};

		const createBugUpdate = function (data, bug, cb) {
			var bugUpdate = {
				bug: bug._id,
				action: data.action,
				username: data.sender.login,
				points: calculatePoints(data.action, bug),
			};
			var newBugUpdate = new BugUpdate(bugUpdate);
			newBugUpdate.save(cb);
		};

		const whenAllDone = function (err, newBugUpdate) {
			if (err) {
				return res.status(400).json(err);
			}
			else {
				return res.json(newBugUpdate);
			}
		};

		async.waterfall([
				validateGithubIssue.bind(this, req.body),
				createBug,
				createBugUpdate,
			],
			whenAllDone
		);
	},

	// BugUpdate update
	update: function (req, res, next) {
		BugUpdate.update(
			{ _id: req.params.id },
			req.body,
			function (updateErr, numberAffected, rawResponse) {
				if (updateErr) {
					res.status(500).json(updateErr);
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
					res.status(500).json(updateErr);
				}
				else {
					res.json(200, 'Deleted ' + numberAffected + ' updates');
				}
			}
		);
	},

}