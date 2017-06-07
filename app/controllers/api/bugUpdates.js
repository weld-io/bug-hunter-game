'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const async = require('async');

const Bug = mongoose.model('Bug');
const BugUpdate = mongoose.model('BugUpdate');

const calculatePoints = function (action, bug) {
	var basePoints;
	switch (action) {
		case 'closed':
			basePoints = 50;
			break;
		case 'opened':
			basePoints = 25;
			break;
		case 'reopened':
			basePoints = 10;
			break;
		case 'edited':
			basePoints = 2;
			break;
		case 'labeled':
		case 'unlabeled':
		case 'assigned':
		case 'unassigned':
			basePoints = 1;
			break;
		default:
			basePoints = 0;
			break;
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
	console.log('calculatePoints', action, bug.labels, basePoints, priorityPoints, '=', basePoints * priorityPoints, bug.title);
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
		console.log('**CREATE GITHUB', JSON.stringify(req.body, null, 2));

		const createBug = function (data, cb) {
			// Convert issue to Bug
			var bugObj = _.merge({}, data.issue);
			bugObj.githubRepositoryId = data.repository.id;
			bugObj.githubIssueId = data.issue.id;
			bugObj.githubNumber = data.issue.number;
			bugObj.url = data.issue.html_url;
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

		const validateRequest = function (data, cb) {
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

		const sendResponse = function (err, newBugUpdate) {
			if (err) {
				return res.status(400).json(err);
			}
			else {
				return res.json(newBugUpdate);
			}
		};

		async.waterfall([
				validateRequest.bind(this, req.body),
				createBug,
				createBugUpdate,
			],
			sendResponse
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

	// BugUpdate recalculate
	recalculate: function (req, res, next) {

		const findBugUpdates = function (idArray, cb) {
			var query = {};
			if (idArray) {
				query._id = { $in: idArray };
			}
			BugUpdate.find(query, cb);
		};

		const getBugForBugUpdate = function (bugUpdate, cb) {
			Bug.findById(bugUpdate.bug, cb);
		};

		const updateBugUpdates = function (bugUpdates, cb) {
			async.each(bugUpdates,
				// For each
				function (bugUpdate, cbEach) {
					getBugForBugUpdate(bugUpdate, function (err, bug) {
						if (err || !bug) {
							cbEach(err);
						}
						else {
							bugUpdate.points = calculatePoints(bugUpdate.action, bug);
							bugUpdate.save(cbEach);							
						}
					})
				},
				// When all done
				function (err) {
					cb(err, bugUpdates.length + ' updated');
				}
			);
		};

		const validateRequest = function (data, cb) {
			cb(null, _.get(data, 'ids'));
		};

		const sendResponse = function (err, result) {
			if (err) {
				return res.status(400).json(err);
			}
			else {
				return res.json({ result: result });
			}
		};

		async.waterfall([
				validateRequest.bind(this, req.body),
				findBugUpdates,
				updateBugUpdates,
			],
			sendResponse
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